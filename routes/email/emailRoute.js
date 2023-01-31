const express = require("express");
const emailController = require("../../controllers/email/emailController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const emailRoute = express.Router();

emailRoute.post("/", authMiddleware, emailController);

module.exports = emailRoute;
