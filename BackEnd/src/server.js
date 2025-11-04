import e from "express";
import express from "express";

const app = express();
app.listen(5001, () => {
  console.log("Server is running on port 5001");
});

export default app;
