const expressAsyncHandler = require("express-async-handler");
const Category = require("../../models/category/category");
const validateMongodbId = require("../../utils/validateMongodbID");

const createCategoryController = expressAsyncHandler(async (req, res) => {
    try {
        const category = await Category.create({
            user: req?.user?._id,
            title: req?.body?.title,
        });
        res.json(category);
    } catch (error) {
        res.json(error);
    }
});

const allCategoryController = expressAsyncHandler(async (req, res) => {
    try {
        const category = await Category.find({})
            .populate("user")
            .sort("-createdAt");
        res.json(category);
    } catch (error) {
        res.json(error);
    }
});

const singleCategoryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const category = await Category.findById(id);
        res.json(category);
    } catch (error) {
        res.json(error);
    }
});

const updateCategoryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const category = await Category.findByIdAndUpdate(
            id,
            {
                title: req?.body?.title,
            },
            {
                new: true,
                runValidators: true,
            }
        );
        res.json(category);
    } catch (error) {
        res.json(error);
    }
});

const deleteCategoryController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const category = await Category.findByIdAndDelete(id);
        res.json(category);
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createCategoryController,
    allCategoryController,
    singleCategoryController,
    updateCategoryController,
    deleteCategoryController,
};
