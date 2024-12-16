import express from "express";
import { forgotpassword, getAllUserDetails, getUserDetails, loginUser, registerUser } from "../controller/auth-controller.js";
import authMiddleware from "../middleware/auth-middleware.js";
import multer from "multer";

const authRouter = express.Router();





// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars"); // Specify the directory for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
    },
});

// File filter for image types
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true); // Accept only image files
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({ storage, fileFilter });

// Register route
authRouter.post("/register", upload.single("avatar"), registerUser);

// Login route
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotpassword);
authRouter.get("/get-all-users", getAllUserDetails);

// Protected route to get user details (requires authentication)
authRouter.get("/profile", authMiddleware, getUserDetails);

export default authRouter;
