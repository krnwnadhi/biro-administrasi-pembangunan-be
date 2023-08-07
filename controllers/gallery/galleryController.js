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

    // -------------------------------------------------------------------------------------

    // const uploader = async (path) =>
    //     await cloudinary.cloudinaryUploadImage(path, "Images");

    // if (req.method === "POST") {
    //     const urls = [];

    //     const files = req.files;

    //     for (const file of files) {
    //         const { path, originalname, size, mimetype, buffer } = file;
    //         // console.log("file galleryController", file);

    //         const newPath = await uploader(path);

    //         const newFile = {
    //             fileName: originalname,
    //             filePath: newPath?.url,
    //             fileType: mimetype,
    //             fileSize: fileSizeFormatter(size, 2),
    //         };

    //         urls.push(newFile);

    //         fs.unlinkSync(path);
    //     }

    //     const response = await Gallery.create({
    //         title: req.body.title,
    //         images: urls,
    //     });
    //     res.json(response);
    // } else {
    //     res.status(500).send("Invalid response from server");
    // }
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
    try {
        const response = await Gallery.find({});
        res.json(response);
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
        const response = await Gallery.findByIdAndUpdate(id, {});
        res.json("Update");
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
