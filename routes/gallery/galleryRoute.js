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
    galleryMdw,
    galleryUploadMdw,
} = require("../../middlewares/upload/photoUploadMdw");

const galleryRoute = express.Router();

galleryRoute.post(
    "/",
    authMiddleware,
    galleryUploadMdw.array("images", 5),
    // galleryMdw,
    createGalleryController
);

galleryRoute.get("/", authMiddleware, allGalleryController);

galleryRoute.get("/:id", authMiddleware, singleGalleryController);

galleryRoute.put("/:id", authMiddleware, updateGalleryController);

galleryRoute.delete("/:id", authMiddleware, deleteGalleryController);

module.exports = galleryRoute;
