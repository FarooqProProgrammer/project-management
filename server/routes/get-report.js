import express from "express";
import path from "path";
import ejs from "ejs";
import pdf from "html-pdf";
import fs from "fs";
import { fileURLToPath } from "url";
import Task from "../models/Task.js";
import puppeteer from "puppeteer";

const reportRouter = express.Router();



reportRouter.get("/get-report", async (req, res) => {
    try {
        const { date, endDate } = req.query;

        // Validate input dates
        if (!date || !endDate) {
          return res.status(400).json({ message: "Start date and end date are required." });
        }
    
        // Convert string dates from query to Date objects for comparison
        const startDate = new Date(date);
        const endDateObj = new Date(endDate);
    
        // Ensure dates are valid
        if (isNaN(startDate) || isNaN(endDateObj)) {
          return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD." });
        }
    
        // Query the tasks with date range filtering
        const tableData = await Task.find({
          taskStartDate: {
            $gte: startDate.toISOString().split("T")[0],  // Ensure we are comparing date strings only (YYYY-MM-DD)
            $lte: endDateObj.toISOString().split("T")[0],  // Same for the end date
          },
        }).populate("assignee").populate("project");
    
        console.log(tableData);
    

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        // Render the HTML with the data using EJS
        const ejsData = {
            generatedOn: new Date().toLocaleString(),
            tableData: tableData,
        };

        const html = await ejs.renderFile(path.join(__dirname, "../views/report.ejs"), ejsData);

        // Define the output PDF file path in the "upload" folder
        const fileName = `report_${Date.now()}.pdf`;  // Unique file name using timestamp
        const outputFilePath = path.join(__dirname, "../uploads", fileName);

        // Generate the PDF and save it to the "upload" folder
        pdf.create(html, { format: "A4" }).toFile(outputFilePath, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error generating PDF");
            }

            // Return the file URL to the client
            const fileUrl = `http://localhost:3001/uploads/${fileName}`;
            res.json({ fileUrl: fileUrl });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing request");
    }
});


reportRouter.get("/get-summary-report", async (req, res) => {
  try {
    // Query the tasks and populate the required fields
    const tableData = await Task.find()
      .populate("assignee")
      .populate("project");


      console.log(tableData)

    // Prepare summarized data with multiple statuses per task
    const summarizedData = [];

    tableData.forEach(task => {
      // Loop through the task's status history
      task.taskStatusHistory.forEach(statusHistory => {
        summarizedData.push({
          taskName: task.taskName,
          taskStatus: statusHistory.status || "No Status",
          projectTitle: task.project ? task.project.projectTitle : "N/A",
          severity: task.project ? task.project.severity : "N/A",
          module: task.module || "N/A",
          taskStartDate: task.taskStartDate,
          taskEndDate: task.taskEndDate,
          statusTimestamp: statusHistory.timestamp || "No Timestamp"
        });
      });
    });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Render the HTML with the summarized data using EJS
    const ejsData = {
      generatedOn: new Date().toLocaleString(),
      tableData: summarizedData,
    };

    const html = await ejs.renderFile(path.join(__dirname, "../views/summary-report.ejs"), ejsData);

    // Generate the PDF using Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const fileName = `summary_report_${Date.now()}.pdf`;
    const outputFilePath = path.join(__dirname, "../uploads", fileName);

    await page.pdf({ path: outputFilePath, format: 'A4' });
    await browser.close();

    const fileUrl = `http://localhost:3001/uploads/${fileName}`;
    res.json({ fileUrl: fileUrl });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing request");
  }
});



export default reportRouter;
