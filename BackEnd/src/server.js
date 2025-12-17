import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import loginRouters from "./routes/loginRouters.js";
import registerRouters from "./routes/registerRouters.js";
import userRouters from "./routes/userRouters.js";
import orderRouters from "./routes/orderRouters.js";

// Load biến môi trường
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/login", loginRouters);
app.use("/api/register", registerRouters);
app.use("/api/users", userRouters);
app.use("/api/orders", orderRouters);

// Route test
app.get("/", (req, res) => {
  res.json({
    message: "Server đang chạy",
    endpoints: {
      register: "POST /api/register",
      login: "POST /api/login",
      users: "GET /api/users",
    },
  });
});

app.listen(PORT, () => {
  console.log(` Server đang chạy tại port ${PORT}`);
});

export default app;
