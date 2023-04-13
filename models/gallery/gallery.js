const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        images: {
            type: [Object],
            default: undefined
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
