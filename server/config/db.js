import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";  // Import Chalk for colored terminal output

dotenv.config();

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // Using chalk to style the output
        console.log(chalk.green.bold(`💾 MongoDB Connected: ${conn.connection.host}`));
    } catch (error) {
       
        console.log(chalk.red.bold('Error connecting to MongoDB:'), chalk.yellow(error.message));
        process.exit(1);
    }
};

export default connectDb;
