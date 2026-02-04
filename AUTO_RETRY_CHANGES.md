# Auto-Retry Implementation Summary

## Overview
Implemented automatic retry functionality that switches to available accounts when an account fails, instead of immediately returning an error.

## Changes Made

### 1. `src/routes/api.js` - API Route Handler

**Key Changes:**
- Added retry loop with maximum 3 attempts
- Track tried accounts to avoid retrying the same failed account
- Automatically switch to next available account on failure
- Enhanced logging to show retry progress

**Implementation Details:**

```javascript
const maxRetries = 3;
const triedAccounts = new Set();

for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    // Select account (excluding already tried accounts)
    selected = await state.accountPool.selectAccount(triedAccounts);

    // Mark this account as tried
    triedAccounts.add(selected.id);

    // Make API call
    // ... (existing code)

    // Success - exit retry loop
    return;

  } catch (error) {
    // Log error and handle account status

    // Check if more accounts available
    const hasMoreAccounts = await state.accountPool.hasAvailableAccounts(triedAccounts);

    if (!hasMoreAccounts || attempt === maxRetries - 1) {
      // No more accounts or max retries reached - return error
      return res.status(status).json({ ... });
    }

    // Continue to next retry
  }
}
```

**Error Handling:**
- **Suspended accounts (403 TEMPORARILY_SUSPENDED)**: Auto-disable and retry with next account
- **Rate limit errors (429)**: Put account in cooldown and retry with next account
- **Other errors**: Record error count and retry with next account

**Console Logging:**
- `账号 {id} ({name}) 因暂停已自动禁用，尝试下一个账号 (1/3)`
- `账号 {id} ({name}) 触发速率限制，尝试下一个账号 (1/3)`
- `账号 {id} ({name}) 请求失败: {error}，尝试下一个账号 (1/3)`

### 2. `src/pool.js` - Account Pool Manager

**Key Changes:**
- Modified `selectAccount()` to accept `excludeIds` parameter
- Added `hasAvailableAccounts()` method to check if more accounts are available

**New Method Signatures:**

```javascript
async selectAccount(excludeIds = new Set()) {
  const available = Array.from(this.accounts.values())
    .filter(a => a.status === 'active' && !excludeIds.has(a.id));
  // ... (rest of selection logic)
}

async hasAvailableAccounts(excludeIds = new Set()) {
  const available = Array.from(this.accounts.values())
    .filter(a => a.status === 'active' && !excludeIds.has(a.id));
  return available.length > 0;
}
```

## How It Works

### Request Flow:

1. **Initial Request**: Client sends request to `/v1/messages`

2. **Account Selection**: System selects first available account (excluding any in `triedAccounts` set)

3. **API Call**: Attempt to call Kiro API with selected account

4. **On Success**: Return response to client immediately

5. **On Failure**:
   - Log the error
   - Handle account status (disable if suspended, cooldown if rate limited)
   - Add account ID to `triedAccounts` set
   - Check if more accounts available
   - If yes: Retry with next account (up to 3 total attempts)
   - If no: Return error to client

### Example Scenario:

**Setup**: 3 accounts (A, B, C) all active

**Request 1**:
- Attempt 1: Account A → Suspended (403) → Auto-disable A, retry
- Attempt 2: Account B → Success → Return response

**Request 2**:
- Attempt 1: Account B → Rate limit (429) → Cooldown B, retry
- Attempt 2: Account C → Success → Return response

**Request 3**:
- Attempt 1: Account C → Rate limit (429) → Cooldown C, retry
- No more active accounts → Return error 503

## Benefits

1. **Improved Reliability**: Automatically handles account failures without user intervention
2. **Better Resource Utilization**: Uses all available accounts before failing
3. **Transparent Failover**: Client doesn't need to retry manually
4. **Clear Logging**: Console shows which accounts failed and why
5. **Prevents Cascading Failures**: Excludes failed accounts from retry attempts

## Configuration

- **Max Retries**: 3 attempts (configurable in code)
- **Account Cooldown**: 5 minutes for rate-limited accounts (existing behavior)
- **Auto-Disable**: Suspended accounts are immediately disabled

## Testing Recommendations

1. Test with single account failure
2. Test with multiple account failures
3. Test with all accounts failing
4. Test rate limit handling
5. Test suspended account handling
6. Verify logging output
7. Check account status updates in admin panel

## Backward Compatibility

✅ Fully backward compatible - existing functionality unchanged:
- Account selection strategies (round-robin, random, least-used) still work
- Error logging and statistics still recorded
- Admin panel shows correct account status
- No breaking changes to API interface
