const expressAsyncHandler = require("express-async-handler");
const validateMongodbId = require("../../utils/validateMongodbID");
const Gallery = require("../../models/gallery/gallery");
const cloudinary = require("../../utils/cloudinary");
const path = require("path");
const fs = require("fs");

const createGalleryController = expressAsyncHandler(async (req, res) => {
    try {
        // get the path to image
        const localPath = `public/images/gallery/${req.file.filename}`;

        //upload to cloudinary
        // const b64 = Buffer.from(req.file.buffer).toString("base64");
        // let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.cloudinaryUploadImage(localPath);

        const galleryUpload = await Gallery.create({
            ...req.body,
            title: req.body.title,
            image: cldRes?.url,
        });
        res.json(galleryUpload);

        fs.unlinkSync(localPath);
    } catch (error) {
        console.log(error);
        res.send({
            message: error.message,
        });
    }
});

const fileSizeFormatter = (bytes, decimal) => {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (
        parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) +
        " " +
        sizes[index]
    );
};

const allGalleryController = expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search_query || "";

    const offset = limit * page;
    const totalItem = await Gallery.countDocuments({
        title: { $regex: search, $options: "i" },
    });
    const totalPage = Math.ceil(totalItem / limit);

    try {
        const result = await Gallery.find({
            title: { $regex: search, $options: "i" },
        })
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .exec();

        // res.json(response);
        res.status(200).json({
            result: result,
            page: page + 1,
            limit: limit,
            totalItem: totalItem,
            totalPage: totalPage,
            hasMore: result.length >= limit ? true : false,
        });
    } catch (error) {
        res.json(error);
    }
});

const singleGalleryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const response = await Gallery.findById(id);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

const updateGalleryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const response = await Gallery.findByIdAndUpdate(
            id,
            {
                title: req?.body?.title,
            },
            {
                new: true,
                runValidators: true,
            }
        );
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

const deleteGalleryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const response = await Gallery.findByIdAndDelete(id);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createGalleryController,
    allGalleryController,
    singleGalleryController,
    updateGalleryController,
    deleteGalleryController,
};
