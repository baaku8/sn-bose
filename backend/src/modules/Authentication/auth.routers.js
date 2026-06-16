
import express from "express" ;
import { userMiddleware } from "../UserProfile/user.middlewares.js";
import { loginUser , logoutUser, registerUser , googleLogin   } from "./auth.controllers.js";
const authRouter =  express.Router();

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

    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});

export default  authRouter;


