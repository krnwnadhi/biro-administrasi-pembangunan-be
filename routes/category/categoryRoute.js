const express = require("express");
const {
    createCategoryController,
    allCategoryController,
    singleCategoryController,
    updateCategoryController,
    deleteCategoryController,
} = require("../../controllers/category/categoryController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const categoryRoute = express.Router();

categoryRoute.post("/", authMiddleware, createCategoryController);

categoryRoute.get("/", authMiddleware, allCategoryController);

categoryRoute.get("/:id", authMiddleware, singleCategoryController);

categoryRoute.put("/:id", authMiddleware, updateCategoryController);

categoryRoute.delete("/:id", authMiddleware, deleteCategoryController);

module.exports = categoryRoute;
