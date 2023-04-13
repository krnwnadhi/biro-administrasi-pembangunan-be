const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../../utils/validateMongodbID");
const fs = require("fs");
const cloudinary = require("../../utils/cloudinary");
const Document = require("../../models/document/document");

const createDocumentController = expressAsyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { path, mimetype } = req.file;
    try {
        const file = new Document({
            title,
            description,
            file_path: path,
            file_mimetype: mimetype,
        });
        await file.save();
        res.json(file);
        // res.json(response);
    } catch (error) {
        res.status(400).send(
            error,
            "Error while uploading file. Try again later."
        );
    }
});

const fetchAllDocumentController = expressAsyncHandler(async (req, res) => {
    try {
        const files = await Document.find({});
        const sortedByCreationDate = files.sort(
            (a, b) => b.createdAt - a.createdAt
        );
        res.send(sortedByCreationDate);
    } catch (error) {
        res.status(400).send(
            "Error while getting list of files. Try again later."
        );
    }
});

const singleDocumentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const file = await Document.findById(id);
        res.set({
            "Content-Type": file.file_mimetype,
        });
        res.sendFile(path.join(__dirname, "..", file.file_path));
    } catch (error) {
        res.status(400).send("Error while downloading file. Try again later.");
    }

    // try {
    //     const response = await Document.findById(id);
    //     res.json(response);
    // } catch (error) {
    //     res.json(error);
    // }
});

const updateDocumentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const response = await Document.findByIdAndUpdate(id, {});
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

const deleteDocumentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const response = await Document.findByIdAndDelete(id);
        // res.json(response);
        res.send("files deleted successfully");
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createDocumentController,
    fetchAllDocumentController,
    singleDocumentController,
    updateDocumentController,
    deleteDocumentController,
};
