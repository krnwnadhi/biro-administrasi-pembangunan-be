const expressAsyncHandler = require("express-async-handler");

const jwt = require("jsonwebtoken");
const User = require("../../models/user/User");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_KEY);
                //find the user by id
                const user = await User.findById(decoded?.id).select(
                    "-password"
                );
                //attach the user to req object
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error(
                "Not authorized! Token expired! Please login again"
            );
        }
    } else {
        throw new Error("No Token header");
    }
});

module.exports = authMiddleware;
