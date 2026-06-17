import { createClient } from 'redis';

export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD ,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));

// 2. Create the specific connection function for server.js to call
export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error(` Error connecting to Redis: ${error.message}`);
        throw error; // We must throw the error so server.js knows it failed!
    }
};
