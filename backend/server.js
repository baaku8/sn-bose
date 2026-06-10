import "dotenv/config"
import app from "./src/app.js";
import DbConnect from "./src/common/config/db.js";
import User from "./src/modules/UserProfile/user.models.js";
import authRouter from "./src/modules/Authentication/auth.routers.js";
import profileRouter from "./src/modules/UserProfile/userProfile.routes.js";
import teamRouter from './src/modules/team/team.routes.js'
import express from "express";
import { connectRedis } from "./src/common/config/redis.js";
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/profile' , profileRouter );
app.use('/',teamRouter)

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

