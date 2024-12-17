import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

// Initialize the slug plugin
mongoose.plugin(slug);


// Define the task schema
const taskSchema = new mongoose.Schema(
    {
        taskName: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            slug: "taskName",
            unique: true,
        },
        taskDescription: {
            type: String,
            required: true,
            trim: true,
        },
        taskStartDate: {
            type: String,
            trim: true,
        },
        taskEndDate: {
            type: String,
            trim: true,
        },
        module: {
            type: String,
            required: true,
            trim: true,
        },
        taskStatus: {
            type: String,
            required: true,
            default: 'open', // Default value set to "open"
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        assignee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        taskImages: [{
            type: String,
        }],
        comments: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false,
            },
            commentMessage: {
                type: String,
                required: false,
                trim: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        taskStatusHistory: [{
            status: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                required: true,
                default: Date.now,
            },
        }],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Optional: Add an index for better querying performance
taskSchema.index({ project: 1, assignee: 1 });

// Optional: Virtuals to return task status in human-readable format
taskSchema.virtual('statusLabel').get(function () {
    return this.taskStatus.charAt(0).toUpperCase() + this.taskStatus.slice(1);
});

// Optional: Static method to find tasks by status
taskSchema.statics.findByStatus = function (status) {
    return this.find({ taskStatus: status });
};

// Optional: Instance method to update task status
taskSchema.methods.updateStatus = function (newStatus) {
    this.taskStatus = newStatus;
    return this.save();
};

// Create the Task model from the schema
const Task = mongoose.model('Task', taskSchema);

export default Task;
