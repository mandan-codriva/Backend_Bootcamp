require("dotenv").config();
const pool = require("../src/config/db");

const runMigration = async () => {
  console.log("\n\x1b[34m[INFO]\x1b[0m Starting Analytics Database Migration...");

  try {
    // 1. Create post_status ENUM type if it doesn't exist
    const typeCheck = await pool.query(
      "SELECT 1 FROM pg_type WHERE typname = 'post_status'"
    );

    if (typeCheck.rows.length === 0) {
      console.log("\x1b[33m[MIGRATE]\x1b[0m Creating custom ENUM type 'post_status'...");
      await pool.query(
        "CREATE TYPE post_status AS ENUM ('draft', 'published', 'scheduled', 'archived')"
      );
      console.log("\x1b[32m[SUCCESS]\x1b[0m ENUM type 'post_status' created successfully.");
    } else {
      console.log("\x1b[34m[INFO]\x1b[0m Custom ENUM type 'post_status' already exists. Skipping.");
    }

    // 2. Add 'status' column to 'posts' table if it doesn't exist
    const statusColCheck = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'status'
    `);

    if (statusColCheck.rows.length === 0) {
      console.log("\x1b[33m[MIGRATE]\x1b[0m Adding 'status' column to 'posts' table...");
      await pool.query(
        "ALTER TABLE posts ADD COLUMN status post_status DEFAULT 'draft'"
      );
      console.log("\x1b[32m[SUCCESS]\x1b[0m 'status' column added successfully.");
    } else {
      console.log("\x1b[34m[INFO]\x1b[0m Column 'status' already exists on table 'posts'. Skipping.");
    }

    // 3. Add 'published_at' column to 'posts' table if it doesn't exist
    const publishedColCheck = await pool.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name = 'published_at'
    `);

    if (publishedColCheck.rows.length === 0) {
      console.log("\x1b[33m[MIGRATE]\x1b[0m Adding 'published_at' column to 'posts' table...");
      await pool.query(
        "ALTER TABLE posts ADD COLUMN published_at TIMESTAMP DEFAULT NOW()"
      );
      console.log("\x1b[32m[SUCCESS]\x1b[0m 'published_at' column added successfully.");
    } else {
      console.log("\x1b[34m[INFO]\x1b[0m Column 'published_at' already exists on table 'posts'. Skipping.");
    }

    // 4. Update any existing posts without status to default to 'published' so they show up
    console.log("\x1b[33m[MIGRATE]\x1b[0m Ensuring existing posts have status set to 'published'...");
    const updateResult = await pool.query(
      "UPDATE posts SET status = 'published' WHERE status IS NULL OR status = 'draft'"
    );
    console.log(`\x1b[32m[SUCCESS]\x1b[0m Updated ${updateResult.rowCount} existing posts to 'published'.`);

    console.log("\n\x1b[32m[COMPLETE]\x1b[0m Migration completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n\x1b[31m[FATAL ERROR] Migration failed:\x1b[0m", error);
    process.exit(1);
  }
};

runMigration();
