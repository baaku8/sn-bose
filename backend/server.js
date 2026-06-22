import "dotenv/config"
import app from "./src/app.js";
import DbConnect from "./src/common/config/db.js";
import User from "./src/modules/UserProfile/user.models.js";
import authRouter from "./src/modules/Authentication/auth.routers.js";
import profileRouter from "./src/modules/UserProfile/userProfile.Routes.js";
import teamRouter from './src/modules/team/team.routes.js'
import express from "express";
import { connectRedis } from "./src/common/config/redis.js";
import cookieParser from "cookie-parser";
import cors from 'cors' ;
import router from "./src/modules/dashboard/dashboard.routes.js";


app.use(express.json());
app.use(cookieParser());

app.use(cors({
    // origin: 'http://localhost:5173', 
    origin: 'https://sn-bose.onrender.com/',
    credentials: true                
}));

app.use('/user', authRouter);
app.use('/profile' , profileRouter );
app.use('/',teamRouter)
app.use('/dashboard',router);

app.use((err, req, res, next) => {
    // Check if it's our custom APIError, otherwise default to 500
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Send a clean JSON response instead of HTML
    res.status(statusCode).json({
        success: false,
        message: message
    });
});

const start = async()=>{
    // await DbConnect();
    await Promise.all([DbConnect(), connectRedis()]);   //connected database

    const PORT=process.env.PORT || 5001;
    app.listen(PORT,()=>{
        console.log(`Server is running in port ${PORT} and is in ${process.env.NODE_ENV} mode`);
    })
}

start().catch((e)=>{
    console.log("Server error found: ",e);
    process.exit(1);
})

