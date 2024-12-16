import jwt from "jsonwebtoken";
import UserModal from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Verify the token and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by decoded ID
        const user = await UserModal.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token is not valid" });
    }
};

export default authMiddleware;
