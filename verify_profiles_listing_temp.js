require('dotenv').config();
const pool = require('./src/config/db');
const profileService = require('./src/modules/profiles/profile.service');

async function verify() {
  console.log("Starting public profiles listing verification...");

  // Let's count existing users or profiles
  const existingCountRes = await pool.query("SELECT COUNT(*)::integer FROM users");
  const existingCount = existingCountRes.rows[0].count;
  console.log(`Current users/profiles count: ${existingCount}`);

  // Create temporary mock users/profiles if count is low
  const mockUsers = [];
  if (existingCount < 5) {
    const mockData = [
      { username: 'prof_alice', email: 'alice_prof@example.com', fullName: 'Alice Alison' },
      { username: 'prof_charlie', email: 'charlie_prof@example.com', fullName: 'Charlie Charleston' },
      { username: 'prof_bob', email: 'bob_prof@example.com', fullName: 'Bob Bobson' },
      { username: 'prof_david', email: 'david_prof@example.com', fullName: 'David Davidson' },
    ];
    for (const data of mockData) {
      // 1. Insert User
      const userRes = await pool.query(
        "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, 'hash', 'user') RETURNING id",
        [data.username, data.email]
      );
      const userId = userRes.rows[0].id;

      // 2. Insert Profile
      await pool.query(
        "INSERT INTO profiles (user_id, full_name, bio) VALUES ($1, $2, 'bio')",
        [userId, data.fullName]
      );

      mockUsers.push({ id: userId, username: data.username });
    }
    console.log(`Inserted ${mockUsers.length} temporary mock users and profiles.`);
  }

  try {
    // 1. Verify basic list and pagination
    console.log("\nTesting Basic Pagination (page=1, limit=2)...");
    let result = await profileService.getAllProfilesService({ page: 1, limit: 2 });
    console.log(`Returned profiles count: ${result.profiles.length}`);
    if (result.profiles.length > 2) {
      throw new Error(`Expected at most 2 profiles, got ${result.profiles.length}`);
    }
    console.log(`Pagination info:`, result.pagination);
    if (result.pagination.limit !== 2) {
      throw new Error(`Expected limit to be 2, got ${result.pagination.limit}`);
    }

    // 2. Verify search functionality (by full_name or username)
    console.log("\nTesting Search functionality (search='alice')...");
    result = await profileService.getAllProfilesService({ page: 1, limit: 10, search: 'alice' });
    console.log(`Profiles returned for search 'alice':`, result.profiles.map(p => ({ username: p.username, full_name: p.full_name })));
    if (result.profiles.length > 0) {
      for (const p of result.profiles) {
        const matches = (p.username && p.username.toLowerCase().includes('alice')) || 
                        (p.full_name && p.full_name.toLowerCase().includes('alice'));
        if (!matches) {
          throw new Error(`Profile ${p.username} (${p.full_name}) does not match search term 'alice'`);
        }
      }
    }
    console.log("Total matching count reported by pagination:", result.pagination.total);

    // 3. Verify sorting by username ASC
    console.log("\nTesting Sort by username ASC...");
    result = await profileService.getAllProfilesService({ page: 1, limit: 10, search: 'prof', sortBy: 'username', sortOrder: 'ASC' });
    const sortedUsernamesAsc = result.profiles.map(p => p.username.toLowerCase());
    console.log("Usernames sorted ASC:", sortedUsernamesAsc);
    for (let i = 0; i < sortedUsernamesAsc.length - 1; i++) {
      if (sortedUsernamesAsc[i] > sortedUsernamesAsc[i + 1]) {
        throw new Error(`Usernames not sorted in ASC order! Error at index ${i}: "${sortedUsernamesAsc[i]}" > "${sortedUsernamesAsc[i + 1]}"`);
      }
    }

    // 4. Verify sorting by username DESC
    console.log("\nTesting Sort by username DESC...");
    result = await profileService.getAllProfilesService({ page: 1, limit: 10, search: 'prof', sortBy: 'username', sortOrder: 'DESC' });
    const sortedUsernamesDesc = result.profiles.map(p => p.username.toLowerCase());
    console.log("Usernames sorted DESC:", sortedUsernamesDesc);
    for (let i = 0; i < sortedUsernamesDesc.length - 1; i++) {
      if (sortedUsernamesDesc[i] < sortedUsernamesDesc[i + 1]) {
        throw new Error(`Usernames not sorted in DESC order! Error at index ${i}: "${sortedUsernamesDesc[i]}" < "${sortedUsernamesDesc[i + 1]}"`);
      }
    }

    // 5. Verify sorting by followers_count DESC
    console.log("\nTesting Sort by followers_count DESC...");
    result = await profileService.getAllProfilesService({ page: 1, limit: 10, sortBy: 'followers_count', sortOrder: 'DESC' });
    const followers = result.profiles.map(p => p.followers_count);
    console.log("Followers count sorted DESC:", followers);
    for (let i = 0; i < followers.length - 1; i++) {
      if (followers[i] < followers[i + 1]) {
        throw new Error(`Followers count not sorted in DESC order! Error at index ${i}: ${followers[i]} < ${followers[i + 1]}`);
      }
    }

    // 6. Verify sorting by invalid field (should default to profiles.created_at safely)
    console.log("\nTesting Invalid sort field (should fallback safely to created_at)...");
    result = await profileService.getAllProfilesService({ page: 1, limit: 10, sortBy: 'invalid_field; DROP TABLE profiles;--', sortOrder: 'ASC' });
    console.log(`Successfully completed without crashing, profiles fetched: ${result.profiles.length}`);

    console.log("\nSUCCESS: All pagination, search, and sorting tests passed for public profiles!");
  } finally {
    // Cleanup mock users/profiles if we inserted them
    if (mockUsers.length > 0) {
      console.log("\nCleaning up mock profiles and users...");
      const mockIds = mockUsers.map(u => u.id);
      await pool.query("DELETE FROM profiles WHERE user_id = ANY($1)", [mockIds]);
      await pool.query("DELETE FROM users WHERE id = ANY($1)", [mockIds]);
      console.log("Mock profiles and users cleaned up.");
    }
    await pool.end();
  }
}

verify().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
