import { google } from "googleapis";
import Event from "../models/event.model.js";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL || "http://localhost:5001"}/api/calendar/google/callback`
);

/**
 * Khởi tạo OAuth flow
 */
export const initiateOAuth = async (req, res) => {
    try {
        const scopes = [
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/userinfo.email",
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            state: req.user.id || req.user._id, // Truyền userId qua state
            prompt: "consent", // Force để lấy refresh token
        });

        res.json({
            success: true,
            authUrl,
        });
    } catch (error) {
        console.error("OAuth initiate error:", error);
        res.status(500).json({ success: false, message: "Lỗi khởi tạo OAuth", error: error.message });
    }
};

/**
 * Xử lý OAuth callback và tự động sync events
 */
export const handleOAuthCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const userId = state; // userId từ state

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Tự động sync Google Calendar events
        try {
            const calendar = google.calendar({ version: "v3", auth: oauth2Client });

            // Lấy events từ Google Calendar (1 năm tới)
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 365);

            const response = await calendar.events.list({
                calendarId: "primary",
                timeMin: now.toISOString(),
                timeMax: futureDate.toISOString(),
                maxResults: 100,
                singleEvents: true,
                orderBy: "startTime",
            });

            const googleEvents = response.data.items || [];
            let importedCount = 0;

            // Import events vào database
            for (const gEvent of googleEvents) {
                if (!gEvent.start || (!gEvent.start.dateTime && !gEvent.start.date)) continue;

                const eventData = {
                    userId,
                    title: gEvent.summary || "Untitled Event",
                    eventType: "custom",
                    date: new Date(gEvent.start.dateTime || gEvent.start.date),
                    recurring: !!gEvent.recurrence,
                    googleEventId: gEvent.id,
                    notes: gEvent.description || "",
                    reminderDays: [7, 3, 1],
                };

                // Check xem event đã tồn tại chưa
                const existingEvent = await Event.findOne({
                    userId,
                    googleEventId: gEvent.id,
                });

                if (!existingEvent) {
                    await Event.create(eventData);
                    importedCount++;
                }
            }

            console.log(`Synced ${importedCount} events from Google Calendar for user ${userId}`);

            // Redirect về frontend với success
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            res.redirect(`${frontendUrl}/calendar?google_auth=success&synced=${importedCount}`);
        } catch (syncError) {
            console.error("Auto-sync error:", syncError);
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
            res.redirect(`${frontendUrl}/calendar?google_auth=success&sync_error=true`);
        }
    } catch (error) {
        console.error("OAuth callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/calendar?google_auth=error`);
    }
};

/**
 * Sync Google Calendar events (manual)
 */
export const syncGoogleCalendar = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { accessToken, refreshToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ success: false, message: "Access token là bắt buộc" });
        }

        // Set credentials
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        // Lấy events từ Google Calendar (30 ngày tới)
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 365); // 1 năm tới

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: now.toISOString(),
            timeMax: futureDate.toISOString(),
            maxResults: 100,
            singleEvents: true,
            orderBy: "startTime",
        });

        const googleEvents = response.data.items || [];
        let importedCount = 0;
        let updatedCount = 0;

        // Import events vào database
        for (const gEvent of googleEvents) {
            if (!gEvent.start || !gEvent.start.dateTime) continue;

            const eventData = {
                userId,
                title: gEvent.summary || "Untitled Event",
                eventType: "custom",
                date: new Date(gEvent.start.dateTime || gEvent.start.date),
                recurring: !!gEvent.recurrence,
                googleEventId: gEvent.id,
                notes: gEvent.description || "",
                reminderDays: [7, 3, 1],
            };

            // Check xem event đã tồn tại chưa
            const existingEvent = await Event.findOne({
                userId,
                googleEventId: gEvent.id,
            });

            if (existingEvent) {
                // Update existing event
                await Event.findByIdAndUpdate(existingEvent._id, eventData);
                updatedCount++;
            } else {
                // Create new event
                await Event.create(eventData);
                importedCount++;
            }
        }

        res.json({
            success: true,
            message: "Đồng bộ Google Calendar thành công",
            data: {
                imported: importedCount,
                updated: updatedCount,
                total: googleEvents.length,
            },
        });
    } catch (error) {
        console.error("Sync Google Calendar error:", error);
        res.status(500).json({ success: false, message: "Lỗi đồng bộ Google Calendar", error: error.message });
    }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
    try {
        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        return credentials;
    } catch (error) {
        console.error("Refresh token error:", error);
        throw error;
    }
};

export default {
    initiateOAuth,
    handleOAuthCallback,
    syncGoogleCalendar,
    refreshAccessToken,
};
