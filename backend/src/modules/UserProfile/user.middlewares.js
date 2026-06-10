import jwt from 'jsonwebtoken';
import { redisClient } from '../../common/config/redis.js';
import User from './user.models.js';
import APIError from '../../common/utils/api-error.js';

export const userMiddleware = async (req, res, next) => {
    try {
        // 1. Get the token from cookies
        const { token } = req.cookies;
        if (!token) {
            throw APIError.unauthorized("Token is not present");
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const { _id } = payload;

        if (!_id) {
            throw APIError.unauthorized("Invalid token");
        }

        const result = await User.findById(_id).select('-password');   // excludeing the password from being send to next route

        if (!result) {
            throw APIError.notFound("User Doesn't Exist");
        }

        // 2. Check the Redis Blacklist
        const isBlacklisted = await redisClient.exists(`token:${token}`);
        if (isBlacklisted) {
            throw APIError.unauthorized("Token has been invalidated. Please log in again.");
        }

        req.user = result; 
        // Move to the next middleware or controller
        next();
    } catch (error) {
        next(error);
    }
};