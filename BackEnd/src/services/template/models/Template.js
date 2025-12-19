import mongoose from "mongoose";
import connection from "../database.js";

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, default: "General" }, // e.g. birthday, love
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default connection.model("Template", TemplateSchema);
