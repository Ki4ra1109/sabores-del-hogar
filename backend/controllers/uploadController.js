const path = require("path");
const fs = require("fs");

exports.uploadSuccess = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No file" });
    const imagen_url = `/catalogo/${req.file.filename}`;
    return res.json({ ok: true, imagen_url });
  } catch (err) {
    console.error("uploadSuccess error:", err);
    return res.status(500).json({ ok: false, message: "Upload failed" });
  }
};
