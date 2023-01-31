const express = require("express");
const {
    createComment,
    allCommentController,
    singleCommentController,
    updateCommentController,
    deleteCommentController,
} = require("../../controllers/comments/commentController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const commentRoute = express.Router();

commentRoute.post("/", authMiddleware, createComment);

commentRoute.get("/", authMiddleware, allCommentController);

commentRoute.get("/:id", authMiddleware, singleCommentController);

commentRoute.put("/:id", authMiddleware, updateCommentController);

commentRoute.delete("/:id", authMiddleware, deleteCommentController);

module.exports = commentRoute;
