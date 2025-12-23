import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const CALENDAR_DB_URI = process.env.CALENDAR_DB_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/giftnity_calendar";

const connection = mongoose.createConnection(CALENDAR_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

connection.on("connected", () => {
    console.log("📅 Calendar DB connected:", CALENDAR_DB_URI.split("@")[1] || CALENDAR_DB_URI);
});

connection.on("error", (err) => {
    console.error("❌ Calendar DB connection error:", err);
});

export default connection;
