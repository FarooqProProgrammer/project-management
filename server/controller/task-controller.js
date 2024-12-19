import { StatusCodes } from "http-status-codes";
import Task from "../models/Task.js";
import multer from "multer";




// Create a new task
export const createTask = async (req, res) => {
    try {
        const { taskName, taskStartDate,taskImages, taskEndDate, taskDescription, module, taskStatus, project, assignee } = req.body;

        // Collect image URLs if files are uploaded

        console.log(req.body)
       

        // Create new task with default status as 'open'
        const newTask = new Task({
            taskName,
            taskDescription,
            taskStatus: taskStatus || 'open', // Default "open" if not provided
            project,
            assignee,
            module,
            taskStartDate,
            taskEndDate,
            taskImages,
            taskStatusHistory: [
                { status: 'open', timestamp: new Date() } // Add the first status change to "open"
            ]
        });

        await newTask.save();

        res.status(StatusCodes.CREATED).json({
            statusCode: StatusCodes.CREATED,
            message: "Task created successfully!",
            task: newTask,
        });
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
        const { taskName, taskStatus, taskDescription, module, taskStartDate, taskEndDate, project, assignee, userId } = req.body; // Extract values from request body

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
        if (module) task.module = module;


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

        console.log(req.cookies)
        // Fetch all tasks from the database
        const tasks = await Task.find().populate("assignee").populate("project").populate("comments.userId");

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
        const task = await Task.findById(taskId).populate("assignee").populate("project");

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

export const AddComment = async (req, res) => {
    try {
        // Extract task ID and comment data from the request
        const { id } = req.params;
        const { userId, commentMessage } = req.body;

        // Check if all required fields are present
        if (!userId || !commentMessage || !id) {
            return res.status(400).json({ error: "Missing required fields: userId, commentMessage, or id" });
        }

        // Update the task with the new comment
        const result = await Task.updateOne(
            { _id: id },
            {
                $push: {
                    comments: { userId, commentMessage, createdAt: new Date() }, // Add createdAt for tracking time of comment
                },
            }
        );

        // Check if the update was successful
        if (result.nModified === 0) {
            return res.status(404).json({ error: "Task not found or comment not added" });
        }

        // Return success response
        return res.status(200).json({ message: "Comment added successfully" });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


// Controller to delete a comment from a task
export const DeleteComment = async (req, res) => {
    try {
        const { taskId, commentId } = req.params;

        // Ensure both taskId and commentId are provided
        if (!taskId || !commentId) {
            return res.status(400).json({ error: "Missing taskId or commentId" });
        }

        // Find the task by ID and remove the comment with the given commentId
        const task = await Task.findOneAndUpdate(
            { _id: taskId },
            {
                $pull: { comments: { _id: commentId } }, // Pull (remove) the comment with the specific _id
            },
            { new: true } // Return the updated task
        );

        // If the task was not found or the comment doesn't exist
        if (!task) {
            return res.status(404).json({ error: "Task or comment not found" });
        }

        // Return success response
        return res.status(200).json({ message: "Comment deleted successfully", task });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


export const openTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Add a new entry to the status history for 'open'
        task.taskStatus = 'open';
        task.taskStatusHistory.push({ status: 'open', timestamp: new Date() });

        await task.save();

        res.status(200).json({
            message: "Task status updated to 'open' successfully!",
            task,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to open task." });
    }
};


export const closeTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ message: "Task not found." });
        }

        // Add a new entry to the status history for 'closed'
        task.taskStatus = 'closed';
        task.taskStatusHistory.push({ status: 'closed', timestamp: new Date() });

        await task.save();

        res.status(200).json({
            message: "Task status updated to 'closed' successfully!",
            task,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, unable to close task." });
    }
};



export const ChangeStatus = async (req, res) => {
    try {
      const { taskId } = req.params; // Extract taskId from request params
      const { taskMessage } = req.body; // Extract taskMessage (new status) from request body
  
        console.log({taskMessage,taskId})

      if (!taskMessage) {
        return res.status(400).json({ error: 'Task message (status) is required' });
      }
  
      // Retrieve the task to check its current status
      const task = await Task.findById(taskId);
  
      // If the task was not found
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
  
      // Check the most recent status in the task's history
      const mostRecentStatus = task.taskStatusHistory[task.taskStatusHistory.length - 1]?.status;
  
      // If the new taskMessage is the same as the most recent status (open or closed)
      if (mostRecentStatus === taskMessage) {
        return res.status(200).json({
          message: `Task is already ${taskMessage}`,
          taskStatusHistory: task.taskStatusHistory, // Send the current task status history
        });
      }
  
      // Update task status and track the change in taskStatusHistory
      const result = await Task.updateOne(
        { _id: taskId }, // Find task by taskId
        {
          $push: {
            taskStatusHistory: {
              status: taskMessage, // Add the new status to taskStatusHistory
              timestamp: new Date(), // Add timestamp to track when status was changed
            },
          },
        }
      );
  
      // If the task wasn't updated
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Task status not changed' });
      }
  
      // Respond with the updated task status history
      const updatedTask = await Task.findById(taskId); // Retrieve the updated task
      return res.status(200).json({
        message: 'Task status updated successfully',
        taskStatusHistory: updatedTask.taskStatusHistory, // Send the updated task status history
      });
    } catch (error) {
      // Handle errors
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while updating the task status' });
    }
  };
  