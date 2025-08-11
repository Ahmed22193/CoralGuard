import mongoose from "mongoose";
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            serverSelectionTimeoutMS:5000
        });
        console.log("database connected successfully.");
        
    } catch (error) {
        console.log("Failed to Connect DB",error.message);
    }
};

export default connectDB;