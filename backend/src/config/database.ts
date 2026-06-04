import mongoose from "mongoose";
import { getMongoUri } from "./env";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(getMongoUri())
        console.log(`Connect Database ${conn.connection.host}`)
    } catch (error) {
        console.log(`Error when connect database ${error}`)
        process.exit(1)
    }
}

export default connectDB