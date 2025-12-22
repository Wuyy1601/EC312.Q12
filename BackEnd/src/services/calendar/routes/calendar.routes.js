import express from "express";
import { authMiddleware } from "../../user/controllers/user.controller.js";
import {
    createEvent,
    getEvents,
    getUpcomingEvents,
    updateEvent,
    deleteEvent,
} from "../controllers/calendar.controller.js";
import {
    initiateOAuth,
    handleOAuthCallback,
    syncGoogleCalendar,
} from "../controllers/googleCalendar.controller.js";

const router = express.Router();

// =============================================
// Calendar CRUD Routes (Protected)
// =============================================

router.post("/events", authMiddleware, createEvent);
router.get("/events", authMiddleware, getEvents);
router.get("/events/upcoming", authMiddleware, getUpcomingEvents);
router.put("/events/:id", authMiddleware, updateEvent);
router.delete("/events/:id", authMiddleware, deleteEvent);

// =============================================
// Google Calendar Integration Routes
// =============================================

// Initiate OAuth (Protected)
router.get("/google/auth", authMiddleware, initiateOAuth);

// OAuth Callback (Public - called by Google)
router.get("/google/callback", handleOAuthCallback);

// Sync Google Calendar (Protected)
router.post("/google/sync", authMiddleware, syncGoogleCalendar);

export default router;
