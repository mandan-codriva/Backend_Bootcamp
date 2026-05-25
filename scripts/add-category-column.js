require("dotenv").config();
const pool = require("../src/config/db");

const runMigration = async () => {
  console.log("\n\x1b[34m[INFO]\x1b[0m Starting Category Column and Role Database Migration...");

  try {
    // 1. Add 'category' column to 'posts' table if it doesn't exist
    const categoryColCheck = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'category'
    `);

    if (categoryColCheck.rows.length === 0) {
      console.log("\x1b[33m[MIGRATE]\x1b[0m Adding 'category' column to 'posts' table...");
      await pool.query(
        "ALTER TABLE posts ADD COLUMN category VARCHAR(100)"
      );
      console.log("\x1b[32m[SUCCESS]\x1b[0m 'category' column added successfully.");
    } else {
      console.log("\x1b[34m[INFO]\x1b[0m Column 'category' already exists on table 'posts'. Skipping.");
    }

    // 2. Migrate existing users with 'creator' role to 'user' role
    console.log("\x1b[33m[MIGRATE]\x1b[0m Migrating any 'creator' roles to 'user'...");
    const roleMigrationResult = await pool.query(
      "UPDATE users SET role = 'user' WHERE LOWER(role) = 'creator'"
    );
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Migrated ${roleMigrationResult.rowCount} users from 'creator' to 'user'.`);

    console.log("\n\x1b[32m[COMPLETE]\x1b[0m Migration completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n\x1b[31m[FATAL ERROR] Migration failed:\x1b[0m", error);
    process.exit(1);
  }
};

runMigration();
