const express = require("express");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
    photoUploadMdw,
    documentUploadMdw,
} = require("../../middlewares/upload/photoUploadMdw");
const {
    createGalleryController,
} = require("../../controllers/gallery/galleryController");
const {
    fetchAllDocumentController,
    singleDocumentController,
    updateDocumentController,
    deleteDocumentController,
    createDocumentController,
} = require("../../controllers/document/documentController");

const documentRoute = express.Router();

documentRoute.post(
    "/",
    // authMiddleware,
    documentUploadMdw.single("files"),
    // galleryMdw,
    createDocumentController,
    (error, req, res, next) => {
        if (error) {
            res.status(500).send(error.message);
        }
    }
);

documentRoute.get(
    "/",
    // authMiddleware
    fetchAllDocumentController
);

documentRoute.get(
    "/:id",
    // authMiddleware,
    singleDocumentController
);

// documentRoute.put("/:id", authMiddleware, updateDocumentController);

documentRoute.delete(
    "/:id",
    // authMiddleware,
    deleteDocumentController
);

module.exports = documentRoute;
