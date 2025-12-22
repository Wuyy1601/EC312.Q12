// Spirit Service Entry Point
import express from "express";
import spiritRoutes from "./spirit.routes.js";

const app = express();
app.use(express.json());
app.use("/api/spirit", spiritRoutes);

export default app;
