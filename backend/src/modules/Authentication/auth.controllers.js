import User from '../UserProfile/user.models.js';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { validate } from '../../common/utils/validator.js';
import { redisClient } from '../../common/config/redis.js';
import APIError from '../../common/utils/api-error.js';
import APIResponse from '../../common/utils/api-response.js';

export const registerUser = async (req, res, next) => {
    try {
        
        try {
            validate(req.body);
        } catch (err) {
            throw APIError.badRequest(err.message);
        }

        const { firstName, lastName, email, password } = req.body;
        
        // 2. Validate essential data
        if (!firstName || !lastName || !email || !password) {
            throw APIError.badRequest("Please provide all required fields (name, email, password).");
        }

        // 3. Prevent duplicate registrations
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw APIError.conflict("A user with this email already exists.");
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 5. Create the user (spreading req.body allows optional fields like skills/bio to be saved if provided)
        const user = await User.create({
            ...req.body,
            password: hashedPassword
        });

        // 6. Format the reply payload
        const reply = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAvailable: user.isAvailable
        };

        // 7. Generate JWT
        // Note: Make sure your .env file has JWT_SECRET defined
        const token = jwt.sign(
            { _id: user._id, email: user.email }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: '1h' }
        );

        // 8. Set the HTTP-Only Cookie
        // Dynamic configuration handles local testing vs live HTTPS deployment
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000, // 1 hour
            httpOnly: true,
            secure: isProduction,         // true in production, false on localhost
            sameSite: isProduction ? 'none' : 'lax' // 'none' for cross-domain, 'lax' for local
        });

        // 9. Send the success response
        return APIResponse.create(res, "User Registered Successfully", {
            user: reply
        });

    } catch (err) {
        next(err);
    }
};

export const loginUser = async (req, res, next) => {

    try{
        const {email, password} = req.body;

        if (!email || !password) {
            throw APIError.badRequest("Please provide both email and password");
        }

        const user = await User.findOne({ email }).select('+password');
        
        // 3. Verify user exists and password matches
        if (!user) {
            throw APIError.unauthorized("Invalid Credentials");
        }

        const match = await bcrypt.compare(password , user.password);

        if(!match)
        {
            throw APIError.unauthorized("Invalid Credentials");
        }
            

        const reply = {
            _id : user._id ,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAvailable: user.isAvailable
        }

        const token =  jwt.sign(
            {_id:user._id , email: user.email },
            process.env.JWT_SECRET_KEY,
            {expiresIn: 60*60}
        );
        
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: isProduction ,        // REQUIRED for live HTTPS sites
            sameSite: isProduction ? 'none' : 'lax'    // REQUIRED for cross-domain cookies
        });

        return APIResponse.ok(res, "Logged In Succesfully", {
            user: reply
        });
    }
    catch(err){
        next(err);
    }
};

export const logoutUser = async (req, res, next) => {
    try {
        // 1. Get the token safely
        // req.cookies might be undefined if cookie-parser isn't working, so we use optional chaining (?.)
        const token = req.cookies?.token;

        if (!token) {
            throw APIError.badRequest("You are already logged out");
        }

        // 2. Decode the token to find its expiration timestamp
        const payload = jwt.decode(token);

        // 3. Add to Redis Blacklist safely
        if (payload && payload.exp) {
            // Using EXAT (Expire At) in the SET command is atomic and highly efficient
            await redisClient.set(`token:${token}`, 'Blocked', {
                EXAT: payload.exp 
            });
        }

        // 4. Clear the cookie using the dynamic environment settings
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        
        // 5. Send a clean JSON response
        return APIResponse.ok(res, "Logged Out Successfully");

    } catch (err) {
        next(err);
    }
};