import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const fileRouter = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination folder for uploaded files
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Specify the file name format (using timestamp for uniqueness)
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// Upload route for multiple files
fileRouter.post("/upload", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const fileUrls = req.files.map((file) => {
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  });

  return res.status(200).json({
    message: "Files uploaded successfully",
    fileUrls: fileUrls,
  });
});

// Route to list all uploaded files
fileRouter.get("/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to list files" });
    }

    const fileUrls = files.map((file) => {
      return `${req.protocol}://${req.get("host")}/uploads/${file}`;
    });

    return res.status(200).json({ files: fileUrls });
  });
});

// Route to delete a file
fileRouter.delete("/delete/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join("uploads", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: "Unable to delete file" });
    }
    return res.status(200).json({ message: "File deleted successfully" });
  });
});



export default fileRouter;
