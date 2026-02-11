export class RateLimiter {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.requestTimestamps = new Map(); // apiKey -> number[]

    // Cleanup stale entries every 5 minutes
    this._cleanupTimer = setInterval(() => this._cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check whether a request from the given API key is allowed.
   * @returns {{ allowed: boolean, retryAfterMs?: number, reason?: string }}
   */
  check(apiKey, rateLimitRpm, dailyTokenQuota) {
    // RPM check: count timestamps in last 60 s
    if (rateLimitRpm > 0) {
      const now = Date.now();
      const timestamps = this.requestTimestamps.get(apiKey) || [];
      const recentCount = timestamps.filter(t => now - t < 60000).length;
      if (recentCount >= rateLimitRpm) {
        const oldestInWindow = timestamps.find(t => now - t < 60000);
        const retryAfterMs = oldestInWindow ? 60000 - (now - oldestInWindow) : 60000;
        return { allowed: false, retryAfterMs, reason: 'rate_limit' };
      }
    }

    // Daily token quota check (query DB)
    if (dailyTokenQuota > 0) {
      const usage = this.dbManager.getApiKeyDailyTokenUsage(apiKey);
      if (usage >= dailyTokenQuota) {
        return { allowed: false, retryAfterMs: null, reason: 'daily_quota' };
      }
    }

    return { allowed: true };
  }

  /**
   * Record that a request was made by the given API key (for RPM tracking).
   */
  recordRequest(apiKey) {
    if (!this.requestTimestamps.has(apiKey)) {
      this.requestTimestamps.set(apiKey, []);
    }
    this.requestTimestamps.get(apiKey).push(Date.now());
  }

  /** Remove entries older than 2 minutes (well outside the 60 s window). */
  _cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requestTimestamps) {
      const recent = timestamps.filter(t => now - t < 120000);
      if (recent.length === 0) {
        this.requestTimestamps.delete(key);
      } else {
        this.requestTimestamps.set(key, recent);
      }
    }
  }
}
