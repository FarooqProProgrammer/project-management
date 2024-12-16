import mongoose from "mongoose"
import slug from "mongoose-slug-updater";


// Initialize the slug plugin
mongoose.plugin(slug);

const SeverityModel = new mongoose.Schema(
    {
        Severity: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            slug: "Severity",
            unique: true,
        },
    },
    { timestamps: true }
);

const SveritySchema = mongoose.model("Severity", SeverityModel);

export default SveritySchema