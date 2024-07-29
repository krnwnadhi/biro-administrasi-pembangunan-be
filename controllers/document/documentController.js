const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../../utils/validateMongodbID");
const Document = require("../../models/document/document");
// const Uploads = require("../../uploads/");
// const path = require("path");

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
    } catch (error) {
        res.status(400).send(
            error,
            "Error while uploading file. Try again later."
        );
    }
});

//fetch all document no pagination
const fetchAllDocumentNoPaginationController = expressAsyncHandler(
    async (req, res) => {
        try {
            const result = await Document.find().sort({ createdAt: -1 });

            res.status(200).json({
                result,
            });
        } catch (error) {
            res.json(error);
        }
    }
);

const fetchAllDocumentController = expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search_query || "";

    const offset = limit * page;
    const totalItem = await Document.countDocuments({
        title: { $regex: search, $options: "i" },
    });
    const totalPage = Math.ceil(totalItem / limit);

    try {
        const result = await Document.find({
            title: { $regex: search, $options: "i" },
        })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        res.status(200).json({
            result: result,
            page: page + 1,
            limit: limit,
            totalItem: totalItem,
            totalPage: totalPage,
            hasMore: result.length >= limit ? true : false,
        });
    } catch (error) {
        res.status(400).send(
            "Error while getting list of files. Try again later."
        );
    }
});

const singleDocumentController = expressAsyncHandler(async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        res.set({
            "Content-Type": document.file_mimetype,
        });

        res.download(document.file_path);

        // console.log(document);
    } catch (error) {
        res.status(400).send("Error sewaktu download. Coba lagi.");
    }
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
        await Document.findByIdAndDelete(id);

        res.send("files deleted successfully");
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createDocumentController,
    fetchAllDocumentController,
    fetchAllDocumentNoPaginationController,
    singleDocumentController,
    updateDocumentController,
    deleteDocumentController,
};
