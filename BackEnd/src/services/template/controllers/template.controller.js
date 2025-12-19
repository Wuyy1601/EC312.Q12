import Template from "../models/Template.js";

// GET ALL
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE
export const createTemplate = async (req, res) => {
  try {
    let { name, imageUrl, category } = req.body;

    // Handle File Upload
    if (req.file) {
      // Construct URL (assuming server serves /uploads)
      const protocol = req.protocol;
      const host = req.get("host");
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    if (!name || !imageUrl) {
      return res.status(400).json({ success: false, message: "Name and Image (or URL) are required" });
    }
    const newTemplate = new Template({ name, imageUrl, category });
    await newTemplate.save();
    res.status(201).json({ success: true, data: newTemplate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteTemplate = async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
