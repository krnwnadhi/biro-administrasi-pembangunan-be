const express = require("express");
const {
    documentUploadMdw,
} = require("../../middlewares/upload/photoUploadMdw");
const {
    fetchAllDocumentController,
    singleDocumentController,
    deleteDocumentController,
    createDocumentController,
    fetchAllDocumentNoPaginationController,
} = require("../../controllers/document/documentController");

const documentRoute = express.Router();

documentRoute.post(
    "/",
    documentUploadMdw.single("files"),
    createDocumentController
);

documentRoute.get("/", fetchAllDocumentController);

documentRoute.get("/nopagination", fetchAllDocumentNoPaginationController);

documentRoute.get("/:id", singleDocumentController);

documentRoute.delete("/:id", deleteDocumentController);

module.exports = documentRoute;
