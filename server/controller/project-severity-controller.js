import SveritySchema from "../models/Severity.js";
import asyncHandler from 'express-async-handler'; // For async error handling
import { StatusCodes } from 'http-status-codes'; // For status codes

class ProjectSeverityController {
    // Create a new Severity
    static createSeverity = asyncHandler(async (req, res) => {
        const { Severity } = req.body;

        // Validate input
        if (!Severity) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Severity field is required'
            });
        }

        try {
            // Create the severity entry
            const newSeverity = await SveritySchema.create({ Severity });
            console.log(newSeverity);

            // Respond with a success message and the created data
            return res.status(StatusCodes.CREATED).json({
                success: true,
                data: newSeverity,
                message: 'Severity created successfully'
            });
        } catch (error) {
            // Handle any errors
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An error occurred while creating the severity',
                error: error.message
            });
        }
    });


    // Update an existing Severity
    static updateSeverity = asyncHandler(async (req, res) => {
        const { id } = req.params; // Get the severity ID from the request params
        const { Severity } = req.body; // Get the updated severity data from the body

        // Validate input
        if (!Severity) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Severity field is required'
            });
        }

        try {
            // Find the severity by ID and update it
            const updatedSeverity = await SveritySchema.findByIdAndUpdate(
                id,
                { Severity },
                { new: true } // Return the updated document
            );

            // If no severity is found, return a 404
            if (!updatedSeverity) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Severity not found'
                });
            }

            // Respond with a success message and the updated data
            return res.status(StatusCodes.OK).json({
                success: true,
                data: updatedSeverity,
                message: 'Severity updated successfully'
            });
        } catch (error) {
            // Handle any errors
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An error occurred while updating the severity',
                error: error.message
            });
        }
    });

    static deleteSeverity = asyncHandler(async (req, res) => {
        try {

            const { id } = req.params;
            const deletedSeverity = await SveritySchema.findByIdAndDelete(id);

            // If no severity is found, return a 404
            if (!deletedSeverity) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Severity not found'
                });
            }

            // Respond with a success message
            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Severity deleted successfully'
            });


        } catch (error) {
            // Handle any errors
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An error occurred while deleting the severity',
                error: error.message
            });
        }

    });

    // Get all Severities
    static getAllSeverities = asyncHandler(async (req, res) => {
        try {
            // Get all severity records
            const severities = await SveritySchema.find();
    
            // If no severities are found, return a 404
            if (!severities.length) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'No severities found'
                });
            }
    
            // Map through the severities and add index + 1 to each severity object
            const severitiesWithIndex = severities.map((severity, index) => ({
                ...severity.toObject(), // Convert Mongoose document to plain object
                id: severity._id,       // Add the ID field
                index: index + 1        // Add the index (starting from 1)
            }));
    
            // Respond with the list of severities with id and index
            return res.status(StatusCodes.OK).json({
                success: true,
                data: severitiesWithIndex,
                message: 'Severities fetched successfully'
            });
        } catch (error) {
            // Handle any errors
            console.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'An error occurred while fetching the severities',
                error: error.message
            });
        }
    });
    
}

export default ProjectSeverityController;
