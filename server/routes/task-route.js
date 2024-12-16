import express from "express";
import multer from "multer";
import path from "path"; // Import path module
import { createTask, deleteTask, getAllTasks, getTaskById, getTasksByProject, getTasksByStatus, updateTask, updateTaskStatus } from "../controller/task-controller.js";

const taskRouter = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // The folder where you want to store the uploaded images
        cb(null, 'uploads/task_images/');
    },
    filename: (req, file, cb) => {
        // Create a unique filename for the uploaded files
        cb(null, Date.now() + path.extname(file.originalname)); // Ensures the file extension is preserved
    }
});

// Initialize multer middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/; // Allowed file extensions
        const mimeType = fileTypes.test(file.mimetype);
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extName) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
}).array('taskImages',5);  

// Define Routes
taskRouter.post('/task', upload, createTask);  // Using multer upload middleware in route
taskRouter.put('/update-task/:taskId', updateTask);
taskRouter.post('/task/:id', deleteTask);
taskRouter.get("/task/status/:status", getTasksByStatus);
taskRouter.get("/task/:taskId", getTaskById);
taskRouter.put("/task/:taskId/status", updateTaskStatus);
taskRouter.get("/project/:projectId", getTasksByProject);
taskRouter.get('/tasks', getAllTasks);

export default taskRouter;
