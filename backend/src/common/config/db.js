import mongoose from "mongoose";

const DbConnect=async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB connected successfully.");
    } catch (error) {
        console.log("Database Connection error: ",error);
    }
}

export default DbConnect