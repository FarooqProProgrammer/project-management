import { StatusCodes } from "http-status-codes";
import Task from "../models/Task.js";
import multer from "multer";




// Create a new task
export const createTask = async (req, res) => {
    try {

        console.log(req.body)

        
        const { taskName, taskStartDate, taskEndDate, taskDescription, module, taskStatus, project, assignee } = req.body;

        // Collect image URLs if files are uploaded
        const taskImages = req.files ? req.files.map(file => `/uploads/task_images/${file.filename}`) : [];

        // Create new task with the provided details and uploaded images
        const newTask = new Task({
            taskName,
            taskDescription,
            taskStatus,
            project,
            assignee,
            module,
            taskStartDate,
            taskEndDate,
            taskImages,
        });

        await newTask.save();

        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            message: "Task created successfully!",
            task: newTask,
        });
        // Use multer middleware to handle file uploads
       
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Server error, unable to create task.",
        });
    }
};


export const updateTask = async (req, res) => {
    try {
      const { taskId } = req.params; // Extract taskId from URL params
      const { taskName, taskStatus, taskDescription, taskStartDate, taskEndDate, project, assignee,userId, comments } = req.body; // Extract values from request body
  
      // Find the task by taskId
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Update task fields
      if (taskName) task.taskName = taskName;
      if (taskStatus) task.taskStatus = taskStatus;
      if (taskDescription) task.taskDescription = taskDescription;
      if (taskStartDate) task.taskStartDate = taskStartDate;
      if (taskEndDate) task.taskEndDate = taskEndDate;
      if (project) task.project = project;
      if (assignee) task.assignee = assignee;
      if (userId) task.userId = userId;
  
      // If there are new comments, push them into the comments array
      if (comments && comments.length > 0) {
        // Loop through comments and add them to the task
        for (const comment of comments) {
          task.comments.push({
            userId: comment.userId,
            commentMessage: comment.commentMessage,
          });
        }
      }
  
      // Save the updated task
      const updatedTask = await task.save();
  
      // Return the updated task
      res.status(200).json({
        message: "Task updated successfully!",
        task: updatedTask,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Get tasks by status
export const getTasksByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const tasks = await Task.find({ taskStatus: status });

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found with this status." });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to fetch tasks." });
    }
};



export const getAllTasks = async (req, res) => {
    try {
        // Fetch all tasks from the database
        const tasks = await Task.find().populate("assignee").populate("project");

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found." });
        }

        // Send the tasks in the response
        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to fetch tasks." });
    }
};

// Get a task by ID
export const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to fetch task." });
    }
};

// Update a task's status
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { newStatus } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        task.taskStatus = newStatus;
        await task.save();

        res.status(200).json({
            message: "Task status updated successfully!",
            task,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to update status." });
    }
};

// Get tasks by project ID
export const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId });

        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for this project." });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to fetch tasks." });
    }
};


export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the task by ID and delete it
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found." });
        }

        res.status(200).json({
            message: "Task deleted successfully!",
            task: deletedTask,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to delete task." });
    }
};