const redis = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  try {
    await client.connect();
    console.log("Connected to Redis successfully");
  } catch (err) {
    console.error("Redis connection error", err);
  }
})();

module.exports = client;
