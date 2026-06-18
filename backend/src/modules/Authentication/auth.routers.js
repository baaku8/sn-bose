
import express from "express" ;
import { userMiddleware } from "../UserProfile/user.middlewares.js";
import { loginUser , logoutUser, registerUser , googleLogin   } from "./auth.controllers.js";
const authRouter =  express.Router();
import APIResponse from "../../common/utils/api-response.js";

authRouter.post('/register', registerUser);
authRouter.post('/login' , loginUser);
authRouter.post('/google', googleLogin);
authRouter.post('/logout', userMiddleware, logoutUser);
authRouter.get('/check', userMiddleware, (req, res) => {
    
    const reply = {
        firstName: req.user.firstName,
        email: req.user.email, 
        _id: req.user._id ,
        role: req.user.role
    };

    return APIResponse.ok(res, "Valid User", { user: reply });
});

export default  authRouter;


