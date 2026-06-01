
const redis = require("redis");

const redisClient = redis.createClient();

redisClient.on("connect", () => {
    console.log("Redis Connected");
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;

