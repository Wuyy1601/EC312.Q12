import express from "express";
import { getTemplates, createTemplate, deleteTemplate } from "../controllers/template.controller.js";
import { uploadSingle } from "../../../shared/utils/upload.js";

const router = express.Router();

router.get("/", getTemplates);
router.post("/", uploadSingle, createTemplate);
router.delete("/:id", deleteTemplate);

export default router;
