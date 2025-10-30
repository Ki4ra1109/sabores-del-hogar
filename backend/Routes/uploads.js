const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_DIR = path.resolve(__dirname, "..", "..", "frontend", "public", "catalogo");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safe);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });
    const imagen_url = `/catalogo/${req.file.filename}`;
    return res.json({ ok: true, imagen_url });
  } catch (err) {
    console.error("upload error:", err);
    return res.status(500).json({ ok: false, message: "Upload failed" });
  }
});

module.exports = router;
