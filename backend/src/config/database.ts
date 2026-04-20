import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI!)
        console.log(`Connect Database ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error when connect database ${error}`)
        process.exit(1)
    }
}

export default connectDB