import "dotenv/config"
import app from "./src/app.js";
import DbConnect from "./src/common/config/db.js";

const PORT=process.env.PORT || 5000;
const start=async()=>{
    await DbConnect();    //connected database
    app.listen(PORT,()=>{
        console.log(`Server is running in port ${PORT} and is in ${process.env.NODE_ENV} mode`);
    })
}

start().catch((e)=>{
    console.log("Server error found: ",e);
    process.exit(1);
})

