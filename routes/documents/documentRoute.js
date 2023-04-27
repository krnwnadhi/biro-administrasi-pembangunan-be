const express = require("express");
const {
    documentUploadMdw,
} = require("../../middlewares/upload/photoUploadMdw");
const {
    createGalleryController,
} = require("../../controllers/gallery/galleryController");
const {
    fetchAllDocumentController,
    singleDocumentController,
    deleteDocumentController,
    createDocumentController,
} = require("../../controllers/document/documentController");

const documentRoute = express.Router();

documentRoute.post(
    "/",
    documentUploadMdw.single("files"),
    createDocumentController
);

documentRoute.get("/", fetchAllDocumentController);

documentRoute.get("/:id", singleDocumentController);

documentRoute.delete("/:id", deleteDocumentController);

module.exports = documentRoute;
