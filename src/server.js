
const path = require("path");
const dotenv = require("dotenv");

// 1. Determine environment (default to 'development' and trim whitespace)
const env = (process.env.NODE_ENV || "development").trim();

// 2. Load environment-specific file first (.env.dev or .env.prod)
const envFile = env === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// 3. Load shared/default .env file for secrets/other configuration (without overriding env-specific variables)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 4. NOW require app (which initializes db.js and routes using correct process.env)
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});