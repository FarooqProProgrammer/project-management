import UserModal from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";  // Import bcrypt
import {
	ReasonPhrases,
	StatusCodes,
} from 'http-status-codes';

// Register user
const registerUser = async (req, res) => {
    const { username, email, password, roles } = req.body;

    try {
        const userExists = await UserModal.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Ensure password is provided
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        let avatarUrl = "";
        if (req.file) {
            avatarUrl = `/uploads/avatars/${req.file.filename}`; // Save the file path
        }

        const newUser = new UserModal({
            username,
            email,
            password, // Save the password as it is
            roles: roles || ['user'], // Default to 'user' role if not provided
            avatar: avatarUrl,
        });

        await newUser.save();

        // Return the user without password (using toObject() to remove password)
        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        res.status(201).json({ message: "User registered successfully", user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Login user and get a token
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log("Request Body:", req.body);

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await UserModal.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log(user.password);
        console.log(password);

        // Compare the provided password with the stored hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'JWT_SECRET',
            { expiresIn: '1h' }
        );

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            avatar: user.avatar,
        };

        res.json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                email: user.email,
                roles: user.roles,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get the authenticated user details
const getUserDetails = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            username: user.username,
            email: user.email,
            roles: user.roles,
            isAdmin: user.isAdmin,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUserDetails = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await UserModal.find();

        // Map through the users and remove the password field
        const usersWithoutPassword = users.map(user => {
            const userObj = user.toObject();
            delete userObj.password; // Remove password from each user object
            return userObj;
        });

        // Return the list of users without their passwords
        res.status(200).json({ users: usersWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const logoutUser = (req, res) => {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Error while logging out" });
            }
            res.json({ message: "Logged out successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Forgot password
// Forgot password
export const forgotpassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(password)
        console.log(email)

        const userExists = await UserModal.findOne({ email });
        console.log(userExists)

        const salt = await bcrypt.genSalt(10);
        let HashPassword = await bcrypt.hash(password, salt);

        const updatedUser = await UserModal.findOneAndUpdate(
            { email: email },
            { $set: { password: HashPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                statusCode: StatusCodes.BAD_REQUEST,
                message: "User not found",
            });
        }

        res.status(StatusCodes.OK).json({
            statusCode: StatusCodes.OK,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }
};

export { registerUser, loginUser, getUserDetails, logoutUser };
