const express = require("express");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
    createGalleryController,
    allGalleryController,
    singleGalleryController,
    updateGalleryController,
    deleteGalleryController,
} = require("../../controllers/gallery/galleryController");
const {
    photoUploadMdw,
    galleryImageResizeMdw,
    galleryMdw,
    galleryUploadMdw,
} = require("../../middlewares/upload/photoUploadMdw");

const galleryRoute = express.Router();

galleryRoute.post(
    "/",
    authMiddleware,
    photoUploadMdw.single("image"),
    galleryImageResizeMdw,
    createGalleryController
);

galleryRoute.put("/:id", authMiddleware, updateGalleryController);

galleryRoute.get("/", allGalleryController);

galleryRoute.get("/:id", authMiddleware, singleGalleryController);

galleryRoute.delete("/:id", authMiddleware, deleteGalleryController);

module.exports = galleryRoute;
