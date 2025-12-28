import { Redis } from "ioredis";
import configs from "./configs";

const redis = new Redis(configs.redisURI);


export default redis;

redis.on("error", (err) => console.error("Redis error:", err));
