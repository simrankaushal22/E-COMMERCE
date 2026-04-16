import mongoose from "mongoose" 

const connectDB= async()=>{

    try {
        
        await  mongoose.connect(process.env.MONGO_URL)
        console.log("mongodb connect successfully");
        

    } catch (error) {
        console.log(`error:${error.message}`,error);
        
    }
}
export default connectDB