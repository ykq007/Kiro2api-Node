import { AccountPool } from './src/pool.js';

// Test batch delete functionality
async function testBatchDelete() {
  console.log('Testing batch delete functionality...\n');

  const config = {
    dataDir: './test-data',
    region: 'us-east-1',
    kiroVersion: '0.8.0'
  };

  const pool = new AccountPool(config);
  await pool.load();

  // Add test accounts
  console.log('Adding test accounts...');
  const id1 = await pool.addAccount({
    name: 'Test Account 1',
    credentials: {
      refreshToken: 'test-token-1',
      authMethod: 'social'
    }
  }, true); // skip validation

  const id2 = await pool.addAccount({
    name: 'Test Account 2',
    credentials: {
      refreshToken: 'test-token-2',
      authMethod: 'social'
    }
  }, true);

  const id3 = await pool.addAccount({
    name: 'Test Account 3',
    credentials: {
      refreshToken: 'test-token-3',
      authMethod: 'social'
    }
  }, true);

  console.log(`Added accounts: ${id1}, ${id2}, ${id3}`);
  console.log(`Total accounts: ${pool.accounts.size}\n`);

  // Test batch delete
  console.log('Testing batch delete...');
  const result = await pool.removeAccounts([id1, id2]);
  console.log('Batch delete result:', result);
  console.log(`Remaining accounts: ${pool.accounts.size}`);
  console.log('Remaining account IDs:', Array.from(pool.accounts.keys()));

  // Verify
  if (result.removed === 2 && pool.accounts.size === 1) {
    console.log('\n✓ Batch delete works correctly!');
  } else {
    console.log('\n✗ Batch delete has issues!');
    console.log(`Expected: removed=2, remaining=1`);
    console.log(`Actual: removed=${result.removed}, remaining=${pool.accounts.size}`);
  }

  // Cleanup
  await pool.removeAccount(id3);
}

testBatchDelete().catch(console.error);
