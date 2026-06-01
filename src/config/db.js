// const {Pool} = require("pg");

//     const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,  
//     port: process.env.DB_PORT
// })
// module.exports = pool;



const { Pool } = require("pg");

const isProduction =
    process.env.NODE_ENV && process.env.NODE_ENV.trim() === "production";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    ssl: isProduction
        ? {
            rejectUnauthorized: false,
        }
        : false,
});

pool.on("connect", () => {
    console.log(
        "PostgreSQL Connected"
    );
});

pool.on("error", (error) => {
    console.error(
        "PostgreSQL Error:",
        error
    );
});

module.exports = pool;

