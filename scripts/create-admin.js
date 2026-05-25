require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
const authRepository = require("../src/modules/auth/auth.repository");
const profileRepository = require("../src/modules/profiles/profile.repository");
const { ROLES } = require("../src/config/roles");

const printUsage = () => {
  console.log(`
\x1b[1m\x1b[36mBlogApp Administrative Bootstrapper\x1b[0m
-----------------------------------
Usage:
  1. Promote an existing user:
     \x1b[33mnode scripts/create-admin.js --promote=<email>\x1b[0m

  2. Create a new Admin user:
     \x1b[33mnode scripts/create-admin.js --username=<username> --email=<email> --password=<password>\x1b[0m
  `);
};

const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.split("=");
      args[key.replace("--", "")] = value;
    }
  });
  return args;
};

const main = async () => {
  const args = parseArgs();

  if (args.promote) {
    const email = args.promote;
    console.log(`\n\x1b[34m[INFO]\x1b[0m Searching for user with email: \x1b[1m${email}\x1b[0m...`);

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      console.log(`\x1b[31m[ERROR] User with email '${email}' not found.\x1b[0m`);
      process.exit(1);
    }

    console.log(`\x1b[34m[INFO]\x1b[0m Promoting user \x1b[1m${user.username}\x1b[0m (ID: ${user.id}) to \x1b[32m${ROLES.ADMIN}\x1b[0m...`);
    const updated = await authRepository.updateUserRole(user.id, ROLES.ADMIN);
    
    console.log(`\n\x1b[32m[SUCCESS] User role updated successfully!\x1b[0m`);
    console.log(JSON.stringify(updated, null, 2));
    process.exit(0);
  } 

  if (args.username && args.email && args.password) {
    const { username, email, password } = args;
    console.log(`\n\x1b[34m[INFO]\x1b[0m Creating a new admin user...`);

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      console.log(`\x1b[31m[ERROR] A user with email '${email}' already exists.\x1b[0m`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser(username, email, passwordHash);
    
    // Create their profile
    await profileRepository.createProfile(user.id);
    
    // Promote to Admin
    const adminUser = await authRepository.updateUserRole(user.id, ROLES.ADMIN);

    console.log(`\n\x1b[32m[SUCCESS] Admin user created and seeded successfully!\x1b[0m`);
    console.log(JSON.stringify(adminUser, null, 2));
    process.exit(0);
  }

  printUsage();
  process.exit(0);
};

main().catch((err) => {
  console.error(`\n\x1b[31m[FATAL ERROR] An unexpected error occurred:\x1b[0m`, err);
  process.exit(1);
});
