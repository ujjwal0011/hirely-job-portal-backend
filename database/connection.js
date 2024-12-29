import mongoose from "mongoose";

export const connection = () => {
    mongoose.connect(process.env.MONGO_URL, {
       dbName: "JOB_PORTAL"
    }).then(() => {
        console.log("MongoDB connection established");
    }).catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    })
}