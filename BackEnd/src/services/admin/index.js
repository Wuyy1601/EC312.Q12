import express from "express";
import adminRoutes from "./admin.routes.js";

const app = express();

app.use(express.json());
app.use("/api/admin", adminRoutes);

export default app;
