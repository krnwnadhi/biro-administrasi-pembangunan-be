const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

// const { DataTypes, Model, Sequelize } = require('sequelize');
// const sequelize = new Sequelize('YOUR_DATABASE_URL'); // You'll need to provide the connection string for your database.

// class Category extends Model {}

// Category.init({
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     userId: {
//         type: DataTypes.INTEGER,
//         references: {
//             model: 'users', // name of the table, not the model (Sequelize automatically pluralizes model names)
//             key: 'id'
//         },
//         allowNull: false
//     },
//     title: {
//         type: DataTypes.STRING,
//         allowNull: false
//     }
// }, {
//     sequelize,
//     modelName: 'Category',
//     tableName: 'categories', // Sequelize by default assumes table names to be pluralized model names
//     timestamps: true,
//     createdAt: 'createdAt',
//     updatedAt: 'updatedAt'
// });

// module.exports = Category;
