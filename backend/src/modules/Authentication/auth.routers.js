
import express from "express" ;
import { userMiddleware } from "../UserProfile/user.middlewares.js";
import { loginUser , logoutUser, registerUser } from "./auth.controllers.js";
const authRouter =  express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login' , loginUser);
authRouter.post('/logout', userMiddleware, logoutUser);


export default  authRouter;


