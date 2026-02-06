const redis = require('redis');

let client;

const connectRedis = async () => {
    client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('connect', () => console.log('Redis Client Connected'));

    await client.connect();
};

const getClient = () => {
    if (!client) {
        throw new Error('Redis client not initialized');
    }
    return client;
};

module.exports = { connectRedis, getClient };