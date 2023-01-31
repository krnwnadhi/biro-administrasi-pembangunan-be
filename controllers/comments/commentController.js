const expressAsyncHandler = require("express-async-handler");
const Comment = require("../../models/comment/Comment");
const validateMongodbId = require("../../utils/validateMongodbID");

const createComment = expressAsyncHandler(async (req, res) => {
    // console.log(req.user);

    //get user
    const user = req.user;

    //get the postid
    const { postId, description } = req.body;
    console.log(postId, description);

    try {
        const comment = await Comment.create({
            post: postId,
            user,
            description,
        });
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

const allCommentController = expressAsyncHandler(async (req, res) => {
    try {
        const comment = await Comment.find({}).sort("-createdAt");
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

const singleCommentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const comment = await Comment.findById(id);
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

const updateCommentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const update = await Comment.findByIdAndUpdate(
            id,
            {
                post: req.body?.postId,
                user: req?.user,
                description: req.body?.description,
            },
            { new: true, runValidators: true }
        );
        res.json(update);
    } catch (error) {
        res.json(error);
    }
});

const deleteCommentController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const comment = await Comment.findByIdAndDelete(id);
        res.json(comment);
    } catch (error) {
        res.json(error);
    }
});

module.exports = {
    createComment,
    allCommentController,
    singleCommentController,
    updateCommentController,
    deleteCommentController,
};
