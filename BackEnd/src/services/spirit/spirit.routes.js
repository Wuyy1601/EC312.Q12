// Spirit Routes
import express from "express";
import { getSpirits, chatWithSpirit, getSpiritBundles } from "./spirit.controller.js";

const router = express.Router();

// GET /api/spirit/list - Get all spirits
router.get("/list", getSpirits);

// POST /api/spirit/chat - Chat with a spirit
router.post("/chat", chatWithSpirit);

// GET /api/spirit/:spiritId/bundles - Get bundles for a spirit
router.get("/:spiritId/bundles", getSpiritBundles);

export default router;
