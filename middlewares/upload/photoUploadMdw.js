const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

//storage
const multerStorage = multer.memoryStorage();

// //disk storage
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, `biroadpemb-${Date.now()}-${file.originalname}`);
    },
});

//file type checking
const multerFilter = (req, file, cb) => {
    //check file type
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        //rejected file
        cb(
            {
                message: "Unsupported file format",
            },
            false
        );
    }
};

const galleryUploadMdw = multer({
    storage: diskStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
});

const photoUploadMdw = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: {
        fileSize: 1000000, // 1 mb
    },
});

//image resize function
const profilePhotoResizeMdw = async (req, res, next) => {
    //check if there is no file
    if (!req.file) return next();

    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

    await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/profile/${req.file.filename}`));
    next();
};

//Post Image Resize function
const postImageResizeMdw = async (req, res, next) => {
    //check if there is no file
    if (!req.file) return next();

    req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(path.join(`public/images/posts/${req.file.filename}`));
    next();
};

const galleryMdw = async (req, res, next) => {
    // // check if there is no file
    // // console.log(req.body);
    // if (!req.files) return next();

    // req.files.originalname = `user-${Date.now()}-${req.files.originalname}`;

    // await sharp(req.files.buffer)
    //     .resize(500, 500)
    //     .toFormat("jpeg")
    //     .jpeg({ quality: 90 })
    //     .toFile(path.join(`public/images/gallery/${req.files.originalname}`));
    // next();

    if (!req.files) return next();

    req.body.images = [];
    // console.log(req.files);

    await Promise.all(
        req.files.map(async (file) => {
            // console.log(file);
            const newName = `biroadpemb-${Date.now()}-${
                req.files.originalname
            }`;

            const newFilename = [];

            await sharp(file.buffer)
                .resize(640, 320)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(path.join(`public/images/gallery/${newName}`));

            req.body.images.push(newFilename);
        })
    );
    next();
};

module.exports = {
    photoUploadMdw,
    profilePhotoResizeMdw,
    postImageResizeMdw,
    galleryMdw,
    galleryUploadMdw,
};
