import { DB_NAME } from "../constant.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URI}/${DB_NAME}`
    );
    console.log(
      `Mongodb connected!! dbhost:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("mongodb connection failed", error);
    process.exit(1);
  }
};
export default connectDB;
