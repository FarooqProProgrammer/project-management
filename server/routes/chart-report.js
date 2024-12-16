// chartReportRouter.js
import express from 'express';
import Task from '../models/Task.js'; // Adjust according to your structure

const chartReportRouter = express.Router();

chartReportRouter.get("/get-chart-report", async (req, res) => {
    try {
        // Fetch all tasks (populate with assignee and project if needed)
        const tasks = await Task.find().populate("assignee").populate("project");

        // Calculate task summary
        const taskSummary = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(task => task.taskStatus === "Completed").length,
            inProgressTasks: tasks.filter(task => task.taskStatus === "In Progress").length,
            pendingTasks: tasks.filter(task => task.taskStatus === "Pending").length,
        };

        // Task Count by Assignee for chart data
        const assigneeCount = tasks.reduce((acc, task) => {
            const assigneeName = task.assignee ? task.assignee.name : "Unassigned";
            acc[assigneeName] = (acc[assigneeName] || 0) + 1;
            return acc;
        }, {});

        // Chart data for assignee distribution
        const chartData = {
            labels: Object.keys(assigneeCount),
            datasets: [{
                label: 'Task Distribution by Assignee',
                data: Object.values(assigneeCount),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };

        // Pass the data to EJS template
        res.render('chartReport', {
            generatedOn: new Date().toLocaleString(),
            taskSummary: taskSummary,
            chartData: JSON.stringify(chartData),
            tableData: tasks.map(task => ({
                taskName: task.taskName,
                assignee: task.assignee ? task.assignee.name : "Unassigned",
                taskStatus: task.taskStatus,
                fromDate: task.fromDate ? new Date(task.fromDate).toISOString().split("T")[0] : "N/A",
                toDate: task.toDate ? new Date(task.toDate).toISOString().split("T")[0] : "N/A",
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing request");
    }
});

export default chartReportRouter;
