import express from "express";
import calendarRoutes from "./routes/calendar.routes.js";

const app = express();

// Mount calendar routes
app.use("/api/calendar", calendarRoutes);

console.log("📅 Calendar Service initialized");

export default app;
