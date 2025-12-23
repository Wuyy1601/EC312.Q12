import Event from "../models/event.model.js";

/**
 * Tạo event mới
 */
export const createEvent = async (req, res) => {
    try {
        const { title, eventType, date, recurring, reminderDays, productCategory, notificationPreferences, notes } = req.body;

        if (!title || !date) {
            return res.status(400).json({ success: false, message: "Title và date là bắt buộc" });
        }

        const newEvent = await Event.create({
            userId: req.user.id || req.user._id,
            title,
            eventType: eventType || "custom",
            date: new Date(date),
            recurring: recurring || false,
            reminderDays: reminderDays || [7, 3, 1],
            productCategory,
            notificationPreferences: notificationPreferences || { email: true, webPush: true },
            notes: notes || "",
        });

        res.status(201).json({
            success: true,
            message: "Tạo sự kiện thành công",
            data: newEvent,
        });
    } catch (error) {
        console.error("Create event error:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

/**
 * Lấy danh sách events của user
 */
export const getEvents = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { eventType, startDate, endDate, includeGoogle } = req.query;

        const query = { userId };

        // Filter theo event type
        if (eventType) {
            query.eventType = eventType;
        }

        // Filter theo date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Exclude Google events nếu không muốn
        if (includeGoogle === "false") {
            query.googleEventId = null;
        }

        const events = await Event.find(query).sort({ date: 1 });

        // Thêm thông tin days until cho mỗi event
        const eventsWithDays = events.map((event) => ({
            ...event.toObject(),
            daysUntil: event.getDaysUntil(),
            isGoogleEvent: event.isGoogleEvent,
        }));

        res.json({
            success: true,
            count: eventsWithDays.length,
            data: eventsWithDays,
        });
    } catch (error) {
        console.error("Get events error:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

/**
 * Lấy upcoming events (trong N ngày tới)
 */
export const getUpcomingEvents = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { days = 30 } = req.query;

        const events = await Event.find({ userId }).sort({ date: 1 });

        // Filter events trong N ngày tới
        const upcomingEvents = events
            .map((event) => ({
                ...event.toObject(),
                daysUntil: event.getDaysUntil(),
                isGoogleEvent: event.isGoogleEvent,
            }))
            .filter((event) => event.daysUntil >= 0 && event.daysUntil <= parseInt(days))
            .sort((a, b) => a.daysUntil - b.daysUntil);

        res.json({
            success: true,
            count: upcomingEvents.length,
            data: upcomingEvents,
        });
    } catch (error) {
        console.error("Get upcoming events error:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

/**
 * Update event
 */
export const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;
        const updates = req.body;

        // Không cho phép update Google events
        const event = await Event.findOne({ _id: id, userId });
        if (!event) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sự kiện" });
        }

        if (event.googleEventId) {
            return res.status(403).json({ success: false, message: "Không thể chỉnh sửa sự kiện từ Google Calendar" });
        }

        // Không cho phép update userId và googleEventId
        delete updates.userId;
        delete updates.googleEventId;

        const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

        res.json({
            success: true,
            message: "Cập nhật sự kiện thành công",
            data: updatedEvent,
        });
    } catch (error) {
        console.error("Update event error:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

/**
 * Delete event
 */
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id || req.user._id;

        const event = await Event.findOne({ _id: id, userId });
        if (!event) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sự kiện" });
        }

        // Không cho phép xóa Google events
        if (event.googleEventId) {
            return res.status(403).json({ success: false, message: "Không thể xóa sự kiện từ Google Calendar" });
        }

        await Event.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Xóa sự kiện thành công",
        });
    } catch (error) {
        console.error("Delete event error:", error);
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

export default {
    createEvent,
    getEvents,
    getUpcomingEvents,
    updateEvent,
    deleteEvent,
};
