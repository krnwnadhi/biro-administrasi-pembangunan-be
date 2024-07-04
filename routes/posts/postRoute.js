const express = require("express");
const {
    createPostController,
    fetchAllPostsController,
    fetchSinglePostController,
    updatePostController,
    deletePostController,
    likePostController,
    dislikePostController,
    fetchPostsPaginationController,
} = require("../../controllers/posts/postController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
    photoUploadMdw,
    postImageResizeMdw,
} = require("../../middlewares/upload/photoUploadMdw");

const postRoute = express.Router();

postRoute.post(
    "/",
    authMiddleware,
    photoUploadMdw.single("image"),
    postImageResizeMdw,
    createPostController
);

postRoute.put("/likes", authMiddleware, likePostController);

postRoute.put("/dislikes", authMiddleware, dislikePostController);

postRoute.get("/", fetchPostsPaginationController);

postRoute.get("/pagination", fetchAllPostsController);

postRoute.get("/:id", fetchSinglePostController);

postRoute.put("/:id", authMiddleware, updatePostController);

postRoute.delete("/:id", authMiddleware, deletePostController);

module.exports = postRoute;
