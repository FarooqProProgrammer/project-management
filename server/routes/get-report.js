import express from "express";
import path from "path";
import ejs from "ejs";
import pdf from "html-pdf";
import fs from "fs";
import { fileURLToPath } from "url";
import Task from "../models/Task.js";

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

export default reportRouter;
