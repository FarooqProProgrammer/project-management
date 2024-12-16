import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

// Initialize the slug plugin
mongoose.plugin(slug);

const projectSchema = new mongoose.Schema(
  {
    projectTitle: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      slug: "projectTitle",
      unique: true, // Ensures the slug is unique
    },
    severity: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    projectStatus: {
      type: String,
      required: true,
    },
    assignee: {
      type: String,
    
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    
    },
    projectImage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const ProjectModel = mongoose.model("Project", projectSchema);
export default ProjectModel;
