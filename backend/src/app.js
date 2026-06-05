import express from "express"

const app=express();
//config
app.use(express.json({limit:"50kb"}));
app.use(express.urlencoded({limit:"16kb"}))


//routes

export default app;



