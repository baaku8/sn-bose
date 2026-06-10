
import express from "express" ;
import { userMiddleware } from "../UserProfile/userMiddleware.js";
import { loginUser , logoutUser, registerUser } from "./authController.js";
const authRouter =  express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login' , loginUser);
authRouter.post('/logout', userMiddleware, logoutUser);


export default  authRouter;


