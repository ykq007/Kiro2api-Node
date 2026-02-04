/**
 * Test script to demonstrate auto-retry functionality
 *
 * This script simulates the retry logic without making actual API calls
 */

class MockAccountPool {
  constructor() {
    this.accounts = new Map([
      ['acc-1', { id: 'acc-1', name: 'Account 1', status: 'active' }],
      ['acc-2', { id: 'acc-2', name: 'Account 2', status: 'active' }],
      ['acc-3', { id: 'acc-3', name: 'Account 3', status: 'active' }],
    ]);
  }

  async selectAccount(excludeIds = new Set()) {
    const available = Array.from(this.accounts.values())
      .filter(a => a.status === 'active' && !excludeIds.has(a.id));

    if (available.length === 0) return null;

    return available[0];
  }

  async hasAvailableAccounts(excludeIds = new Set()) {
    const available = Array.from(this.accounts.values())
      .filter(a => a.status === 'active' && !excludeIds.has(a.id));
    return available.length > 0;
  }

  async disableAccount(id) {
    const account = this.accounts.get(id);
    if (account) {
      account.status = 'disabled';
      console.log(`  → Account ${id} disabled`);
    }
  }

  async recordError(id, isRateLimit) {
    const account = this.accounts.get(id);
    if (account && isRateLimit) {
      account.status = 'cooldown';
      console.log(`  → Account ${id} in cooldown`);
    }
  }
}

// Simulate API call with different error scenarios
async function simulateApiCall(accountId, scenario) {
  console.log(`  Calling API with ${accountId}...`);

  switch (scenario) {
    case 'suspended':
      throw { status: 403, message: 'TEMPORARILY_SUSPENDED' };
    case 'rate-limit':
      throw { status: 429, message: 'Rate limit exceeded' };
    case 'success':
      return { success: true, data: 'Response data' };
    default:
      throw { status: 500, message: 'Internal error' };
  }
}

// Test the retry logic
async function testRetryLogic(testName, scenarios) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test: ${testName}`);
  console.log('='.repeat(60));

  const accountPool = new MockAccountPool();
  const maxRetries = 3;
  const triedAccounts = new Set();
  let scenarioIndex = 0;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`\nAttempt ${attempt + 1}/${maxRetries}:`);

      const selected = await accountPool.selectAccount(triedAccounts);
      if (!selected) {
        console.log('  ✗ No available accounts');
        return { success: false, reason: 'No accounts' };
      }

      console.log(`  Selected: ${selected.id} (${selected.name})`);
      triedAccounts.add(selected.id);

      const scenario = scenarios[scenarioIndex++] || 'success';
      const result = await simulateApiCall(selected.id, scenario);

      console.log(`  ✓ Success!`);
      return { success: true, result };

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);

      const selected = Array.from(accountPool.accounts.values())
        .find(a => triedAccounts.has(a.id) && a.status === 'active');

      if (selected) {
        const isSuspended = error.status === 403 && error.message?.includes('TEMPORARILY_SUSPENDED');

        if (isSuspended) {
          await accountPool.disableAccount(selected.id);
        } else {
          const isRateLimit = error.status === 429;
          await accountPool.recordError(selected.id, isRateLimit);
        }
      }

      const hasMoreAccounts = await accountPool.hasAvailableAccounts(triedAccounts);
      if (!hasMoreAccounts || attempt === maxRetries - 1) {
        console.log(`\n  ✗ Final result: Failed after ${attempt + 1} attempts`);
        return { success: false, reason: error.message };
      }

      console.log(`  → Retrying with next account...`);
    }
  }
}

// Run tests
async function runTests() {
  console.log('\n🧪 Auto-Retry Functionality Tests\n');

  // Test 1: First account suspended, second succeeds
  await testRetryLogic(
    'Suspended account → Success',
    ['suspended', 'success']
  );

  // Test 2: First account rate limited, second succeeds
  await testRetryLogic(
    'Rate limit → Success',
    ['rate-limit', 'success']
  );

  // Test 3: Two failures, third succeeds
  await testRetryLogic(
    'Multiple failures → Success',
    ['suspended', 'rate-limit', 'success']
  );

  // Test 4: All accounts fail
  await testRetryLogic(
    'All accounts fail',
    ['suspended', 'rate-limit', 'error']
  );

  console.log('\n' + '='.repeat(60));
  console.log('✓ All tests completed');
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(console.error);
