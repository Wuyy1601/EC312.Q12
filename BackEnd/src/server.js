import express from "express";
import dotenv from "dotenv";
import loginRouters from "./routes/loginRouters.js";
import registerRouters from "./routes/registerRouters.js";
import userRouters from "./routes/userRouters.js";

// Load biến môi trường
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/login", loginRouters);
app.use("/api/register", registerRouters);
app.use("/api/users", userRouters);

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
  console.log(`🚀 Server đang chạy tại port ${PORT}`);
});

export default app;
