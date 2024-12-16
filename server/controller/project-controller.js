import ProjectModel from "../models/Project.js";

export const createProject = async (req, res) => {
    try {
        const { projectTitle, severity, startDate, endDate, projectStatus, assignee, userId } = req.body;

        console.log(req.body)


        let projectImageUrl = '';
        if (req.file) {
            // If a file is uploaded, get its URL
            projectImageUrl = `/uploads/${req.file.filename}`;
        }

        const newProject = new ProjectModel({
            projectTitle,
            severity,
            startDate,
            endDate,
            projectStatus,
            assignee,
            userId,
            projectImage: projectImageUrl, // Save the image URL to MongoDB
        });

        await newProject.save();
        return res.status(201).json({ message: 'Project created successfully', project: newProject });


    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create project', error: error.message });
    }
}


export const getAllProjectCount = async (req, res) => {
    try {
        // Fetch the most recent 4 projects, sorted by creation date (descending order)
        const recentProjects = await ProjectModel.find()
            .sort({ createdAt: -1 }) // Sorting by descending order of the createdAt field
            .limit(4); // Limiting to the top 4 results

        // Send the response with the projects
        res.status(200).json(recentProjects);
    } catch (error) {
        // Handle any errors
        console.error("Error fetching recent projects:", error);
        res.status(500).json({ error: "An error occurred while fetching projects." });
    }
};



export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;  // Get the product ID from the URL parameters

        // Find and delete the product
        const deletedProduct = await ProjectModel.findByIdAndDelete(id);

        // If no product is found, send a 404 response
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Send success response
        return res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params; // Get the project ID from the URL parameter
        const { projectTitle, severity, startDate, endDate, projectStatus, assignee, userId } = req.body;


        console.log({...req.body,projectId})

        // Find the project by its ID
        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Update project fields with new data, but don't modify the image field
        project.projectTitle = projectTitle;
        project.severity = severity;
        project.startDate = startDate;
        project.endDate = endDate;
        project.projectStatus = projectStatus;
        project.assignee = assignee;
        project.userId = userId;

        // Save the updated project to the database
        await project.save();

        return res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update project', error: error.message });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        // Find all projects and populate userId with specific fields (optional)
        const projects = await ProjectModel.find()
            .populate('userId', 'username email') // Replace 'username' and 'email' with the fields you need
            .exec(); // Ensure that the query is executed

        // If no projects found, return a 404 response
        if (!projects.length) {
            return res.status(404).json({ message: 'No projects found' });
        }

        // Return the projects with a 200 OK response
        return res.status(200).json({ projects });
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error fetching projects:', error);

        // Return a 500 Internal Server Error response
        return res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
    }
};

export const getSingle = async (req, res) => {
    try {
        

        const id = req.params.id;

        const projects = await ProjectModel.find({ _id:id })
            .populate('userId', 'username email') 
            .exec(); 

       
        if (!projects.length) {
            return res.status(404).json({ message: 'No projects found' });
        }

        return res.status(200).json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);

        return res.status(500).json({ message: 'Failed to retrieve projects', error: error.message });
    }
};


export const deleteManyProjects = async (req, res) => {
    try {

        
        const { ids } = req.body; // Expect an array of project IDs to delete

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No project IDs provided' });
        }

        // Perform the delete operation
        const result = await ProjectModel.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No projects found with the given IDs' });
        }

        return res.status(200).json({
            message: `${result.deletedCount} project(s) deleted successfully`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete projects', error: error.message });
    }
};
