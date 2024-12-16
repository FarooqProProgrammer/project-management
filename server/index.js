import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import chalk from 'chalk';
import connectDb from './config/db.js';
import authRouter from './routes/auth-routes.js';
import cors from "cors";
import projectRouter from './routes/project-route.js';
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import taskRouter from './routes/task-route.js';
import morgan from 'morgan';
import reportRouter from './routes/get-report.js';
import ejs from "ejs";
import session from "express-session";
import MongoStore from 'connect-mongo';  // Import connect-mongo
import chartReportRouter from "./routes/chart-report.js"
import ProjectSeverityRoutes from "./routes/project-severity-routes.js"


dotenv.config();

const app = express();

// MongoDB session store setup using connect-mongo
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Set to true if using HTTPS
        maxAge: 60000 // Session cookie expiration time in milliseconds
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB connection string from env
        collectionName: 'sessions', // Optional collection name
        ttl: 14 * 24 * 60 * 60 // Session time-to-live (TTL) in seconds (e.g., 14 days)
    })
}));

// Morgan setup for logging requests
const morganFormat = ':method :url :status :response-time ms - :res[content-length]';
morgan.token('method', (req, res) => {
    return chalk.bold.green(req.method); // Color the HTTP method
});

morgan.token('url', (req, res) => {
    return chalk.blue(req.url); // Color the URL
});

morgan.token('status', (req, res) => {
    return chalk.yellow(res.statusCode); // Color the status code
});

morgan.token('response-time', (req, res) => {
    return chalk.magenta(`${res.responseTime}ms`); // Color response time
});

morgan.token('content-length', (req, res) => {
    return chalk.cyan(res.getHeader('content-length')); // Color content length
});

app.use(morgan(morganFormat)); // Enable morgan middleware

app.use(express.json());
app.use(express.static("uploads"));
app.use(express.static("public"));
app.use(cors());

// MONGO DB CONNECTION
connectDb();

const server = http.createServer(app);

const io = new socketIo(server);

io.on('connection', (socket) => {
    console.log(chalk.green.bold(`✈️ A new user has connected!`));

    socket.on('message', (data) => {
        console.log(chalk.blue('Received message from client:'), chalk.yellow(data));
    });

    socket.emit('welcome', { message: 'Welcome to the server!' });

    socket.on('disconnect', () => {
        console.log(chalk.red.bold(`✈️ A user has disconnected`));
    });
});

// Example route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');

app.set('view engine', 'ejs');

app.use(express.static("views"));

// ALL APP ROUTES
app.use('/api/auth', authRouter);
app.use('/api', projectRouter);
app.use('/api', taskRouter);
app.use('/api', reportRouter);
app.use('/api', chartReportRouter);
app.use('/api', ProjectSeverityRoutes)

app.get('/uploads/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Check if the file exists
    fs.exists(filePath, (exists) => {
        if (exists) {
            // If the file exists, serve it
            res.sendFile(filePath);
        } else {
            // If the file does not exist, return a 404
            res.status(404).json({ message: 'File not found' });
        }
    });
});

// Start the server with an airplane icon and color
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(chalk.cyan.bold(`✅ Server is Running on port http://localhost:${PORT}`));
});
