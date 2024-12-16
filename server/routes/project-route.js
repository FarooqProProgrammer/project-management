import express from "express"
import multer from "multer"
import { createProject, deleteManyProjects, deleteProduct, getAllProjectCount, getAllProjects, getSingle, updateProject } from "../controller/project-controller.js";
import path from "path"
import Task from "../models/Task.js";
import ProjectModel from "../models/Project.js";
import { fileURLToPath } from "url";
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()


const projectRouter = express.Router();



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only .jpg, .jpeg, .png files are allowed'), false);
    }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })


projectRouter.post("/create-project", upload.single("projectImage"), createProject)
projectRouter.put('/update-project/:projectId', updateProject);
projectRouter.get("/get-all-project", getAllProjects)
projectRouter.get("/get-all-project-count", getAllProjectCount)
projectRouter.get("/get-project/:id", getSingle);
projectRouter.post('/delete-projects', deleteManyProjects);
projectRouter.delete('/delete-project/:id', deleteProduct);


projectRouter.get('/total-counts', async (req, res) => {
    try {
        const totalCounts = await ProjectModel.countDocuments();
        const TaskCount = await Task.countDocuments();

        const TaskCompleted = await Task.find({ taskStatus: 'Completed' }).countDocuments();
        const InProgress = await Task.find({ taskStatus: 'In Progress' }).countDocuments();


        res.status(200).json({ project: totalCounts, TaskCount, completedTask: TaskCompleted, InProgress });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve total counts', error: error.message });
    }
})
projectRouter.get("/summary", async (req, res) => {
    try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Fetch task data from the database
        const completedTasksCount = await Task.countDocuments({ taskStatus: 'Completed' });
        const inProgressTasksCount = await Task.countDocuments({ taskStatus: 'In Progress' });

        // Fetch project data from the ProjectModel
        const PendingProjects = await ProjectModel.countDocuments({ projectStatus: "pending" });
        const CompletedProjects = await ProjectModel.countDocuments({ projectStatus: "completed" });

        // If no data is available for tasks or projects, return an empty response or handle it accordingly
        if (completedTasksCount === 0 && inProgressTasksCount === 0 && CompletedProjects === 0 && PendingProjects === 0) {
            return res.send("No tasks or projects available.");
        }

        // Total number of tasks (completed + in-progress)
        const totalTasks = completedTasksCount + inProgressTasksCount;

        // Calculate percentages for tasks
        const completedPercentage = (completedTasksCount / totalTasks) * 100;
        const inProgressPercentage = (inProgressTasksCount / totalTasks) * 100;

        // Create HTML content for task and project status overview
        const htmlContent = `
        <html>
          <head>
            <title>Task & Project Status Page</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin: 0;
                padding: 0;
                background-color: #f4f4f9;
              }
              h1 {
                color: #333;
                margin-top: 50px;
              }
              .chart-container {
                width: 90%;
                margin: 20px auto;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
              }
              .chart-container {
                background-color: white;
                border-radius: 30px;
                box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
                padding: 20px;
              }

              /* Download button styling */
              .download-btn {
                position: absolute;
                top: 30px;
                right: 30px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
              }

              /* Hide the download button when printing */
              @media print {
                .download-btn {
                  display: none;
                }

                #taskStatusChart, #projectStatusChart {
                  width: 100% !important;
                  height: 150px !important;
                  max-width: 150px;
                  margin: 0 auto;
                }
                @page {
                    size: A4;
                    margin: 2cm;
                }
              }

              /* Styling for the task and project charts */
              #taskStatusChart, #projectStatusChart {
                width: 100% !important;
                height: 300px !important;
                max-width: 400px;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <h1>Summary Report</h1>
          
            <!-- Download Button -->
            <button class="download-btn" onclick="downloadPDF()">Download PDF</button>
  
            <div class="grid">
              <!-- Task Status Chart -->
              <div class="chart-container">
              <h5>Task</h5>
                <canvas id="taskStatusChart"></canvas>
              </div>
              <!-- Project Status Chart -->
              <div class="chart-container">
                <h5>Projects</h5>
                <canvas id="projectStatusChart"></canvas>
              </div>
            </div>
  
            <div class="project-status">
              <h2>Project Status</h2>
              <p>Total Completed Projects: ${CompletedProjects}</p>
              <p>Total Pending Projects: ${PendingProjects}</p>
            </div>

            <script>
              // Task Status Chart Data
              const completedTasks = ${completedPercentage};
              const inProgressTasks = ${inProgressPercentage};
      
              const taskStatusData = {
                labels: ['Completed', 'In Progress'],
                datasets: [{
                  label: 'Task Status',
                  data: [completedTasks, inProgressTasks],
                  backgroundColor: ['#36A2EB', '#FFCE56'],
                  hoverBackgroundColor: ['#1E90FF', '#FFD700'],
                }]
              };
      
              const taskStatusOptions = {
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function(tooltipItem) {
                        const taskCount = tooltipItem.raw;
                        return tooltipItem.label + ': ' + taskCount.toFixed(2) + '%';
                      }
                    }
                  }
                }
              };
      
              const ctx1 = document.getElementById('taskStatusChart').getContext('2d');
              const taskStatusChart = new Chart(ctx1, {
                type: 'pie',
                data: taskStatusData,
                options: taskStatusOptions
              });
  
              // Project Status Chart Data
              const completedProjects = ${CompletedProjects};
              const pendingProjects = ${PendingProjects};
      
              const projectStatusData = {
                labels: ['Completed', 'Pending'],
                datasets: [{
                  label: 'Project Status',
                  data: [completedProjects, pendingProjects],
                  backgroundColor: ['#4CAF50', '#FF5722'],
                  hoverBackgroundColor: ['#388E3C', '#E64A19'],
                }]
              };
      
              const projectStatusOptions = {
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function(tooltipItem) {
                        const projectCount = tooltipItem.raw;
                        return tooltipItem.label + ': ' + projectCount;
                      }
                    }
                  }
                }
              };
      
              const ctx2 = document.getElementById('projectStatusChart').getContext('2d');
              const projectStatusChart = new Chart(ctx2, {
                type: 'pie',
                data: projectStatusData,
                options: projectStatusOptions
              });

              // Download PDF function
              function downloadPDF() {
                window.print(); // This triggers the browser's print dialog (Ctrl + P)
              }
            </script>
          </body>
        </html>
      `;

        // Generate random ID once and reuse it
        const randomId = generateRandomId(30);

        const serverUrl = `${req.protocol}://${req.hostname}:${process.env.PORT}`;


        // Save HTML to file
        const filePath = path.join(__dirname, '../uploads', `task_project_status-${randomId}.html`);
        fs.writeFile(filePath, htmlContent, (err) => {
            if (err) {
                console.error("Error saving HTML file:", err);
                return res.status(500).send("Error saving HTML file");
            }

            // Send URL of the saved file
            const fileUrl = serverUrl + `/uploads/task_project_status-${randomId}.html`;
            res.send({ fileUrl });
        });
    } catch (error) {
        console.error("Error rendering HTML content:", error);
        res.status(500).send("Error rendering HTML content");
    }
});


// Function to generate a random ID
function generateRandomId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}




export default projectRouter