import express from "express"
import ProjectSeverityController from "../controller/project-severity-controller.js"

const ProjectSeverityRoutes = express.Router();


ProjectSeverityRoutes.get('/severity', ProjectSeverityController.getAllSeverities);
ProjectSeverityRoutes.post("/create-severity",ProjectSeverityController.createSeverity)
ProjectSeverityRoutes.put('/severity/:id', ProjectSeverityController.updateSeverity);
ProjectSeverityRoutes.delete('/severity/:id', ProjectSeverityController.deleteSeverity);


export default ProjectSeverityRoutes;