const expressAsyncHandler = require("express-async-handler");
const Post = require("../../models/post/Post");
const validateMongodbId = require("../../utils/validateMongodbID");
const fs = require("fs");
const Filter = require("bad-words");
const User = require("../../models/user/User");
const cloudinary = require("../../utils/cloudinary");
const mongoosePaginate = require("mongoose-paginate-v2");

const createPostController = expressAsyncHandler(async (req, res) => {
    // console.log(req.file);

    const { _id } = req?.body;

    // validateMongodbId(req.body.user);

    //Check for bad words
    const filter = new Filter();
    const isProfane = filter.isProfane(req.body.title, req.body.description);

    //Block user
    if (isProfane) {
        await User.findByIdAndUpdate(_id, {
            isBlocked: true,
        });
        throw new Error("Creating Failed because it contains bad words");
    }

    // get the path to image
    const localPath = `public/images/posts/${req.file.filename}`;
    // console.log("localPath", localPath);

    //upload to cloudinary
    const imgUploaded = await cloudinary.cloudinaryUploadImage(localPath);
    // console.log("imgUploaded", imgUploaded);

    try {
        const post = await Post.create({
            ...req.body,
            user: req?.user?._id,
            image: imgUploaded?.url,
            // title: req.body.title,
        });
        res.json(post);

        // res.json(imgUploaded);

        //remove uploaded images
        fs.unlinkSync(localPath);
    } catch (error) {
        res.json(error);
    }
});

//fetch all posts
// const fetchAllPostsController = expressAsyncHandler(async (req, res) => {
//     const hasCategory = req.query.category;
//     const hasPage = parseInt(req.query.page);

//     try {
//         //check if has a category
//         if (hasCategory) {
//             const posts = await Post.find({ category: hasCategory }, null, {
//                 limit: 3,
//                 skip: 2,
//             }).populate("user");
//             res.json(posts);
//         } else {
//             const posts = await Post.find({}).populate("user");

//             res.status(200).json(posts);
//         }
//     } catch (error) {
//         res.json(error);
//     }
// });

// //pagination
// const getPagination = (page, size) => {
//     const limit = size ? +size : 5;
//     const offset = page ? page * limit : 0;

//     return { limit, offset };
// };

// // //fetch all posts
// const fetchAllPostsController = expressAsyncHandler(async (req, res) => {
//     const { page, size, title } = req.query;
//     // const { page, size, title } = req.body;

//     var condition = title
//         ? { title: { $regex: new RegExp(title), $options: "i" } }
//         : {};

//     const { limit, offset } = getPagination(page, size);

//     // const myCustomLabels = {
//     //     docs: "postItem",
//     //     totalDocs: "itemCount",
//     //     limit: "perPage",
//     //     page: "currentPage",
//     //     nextPage: "next",
//     //     prevPage: "prev",
//     //     totalPages: "pageCount",
//     // };

//     // const options = {
//     //     page: 1,
//     //     limit: 5,
//     //     customLabels: myCustomLabels,
//     // };

//     try {
//         // if (req.query.q != null) {
//         //     query.title = new RegExp(req.query.q, "i");
//         //     query.description = new RegExp(req.query.q, "i");
//         // }
//         // const posts = await Post.paginate({}, options);

//         Post.paginate(condition, { offset, limit }).then((data) => {
//             res.json({
//                 totalItems: data.totalDocs,
//                 postList: data.docs,
//                 totalPages: data.totalPages,
//                 currentPage: data.page,
//             });
//         });

//         // res.json(posts);
//     } catch (error) {
//         res.json(error);
//     }
// });

//fetch all posts
const fetchAllPostsController = expressAsyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || "";
        const sort = req.query.sort || "category";

        req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

        let sortBy = {};

        if (sort[1]) {
            sortBy[sort[0]] = sort[1];
        } else {
            sortBy[sort[0]] = "asc";
        }

        const posts = await Post.find({
            title: { $regex: search, $options: "i" },
        })
            .sort(sortBy)
            .skip(page * limit)
            .limit(limit);

        const total = await Post.countDocuments({
            title: { $regex: search, $options: "i" },
        });

        const response = {
            error: false,
            total,
            page: page + 1,
            limit,
            posts,
        };

        res.status(200).json(response);
    } catch (error) {
        res.json(error);
    }
});

// //fetch all posts
// const fetchAllPostsController = expressAsyncHandler(async (req, res) => {
//     try {
//         const result = await Post.find()
//             .populate("user")
//             .sort({ createdAt: -1 })
//             .skip(offset)
//             .limit(limit)
//             .exec();

//         res.status(200).json({
//             result: result,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// });

// //fetch all posts
// const fetchAllPostsController = expressAsyncHandler(async (req, res) => {
//     const page = parseInt(req.query.page) - 1 || 0;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search_query || "";

//     const offset = limit * page;
//     const totalItem = await Post.countDocuments({
//         title: { $regex: search, $options: "i" },
//     });
//     const totalPage = Math.ceil(totalItem / limit);

//     try {
//         const result = await Post.find({
//             title: { $regex: search, $options: "i" },
//         })
//             .populate("user")
//             .sort({ createdAt: -1 })
//             .skip(offset)
//             .limit(limit)
//             .exec();

//         res.status(200).json({
//             result: result,
//             page: page + 1,
//             limit: limit,
//             totalItem: totalItem,
//             totalPage: totalPage,
//             hasMore: result.length >= limit ? true : false,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// });

//fetch a single post
const fetchSinglePostController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const post = await Post.findById(id)
            .populate("user")
            .populate("dislikes")
            .populate("likes");

        //update number of views
        await Post.findByIdAndUpdate(
            id,
            {
                $inc: {
                    numViews: 1,
                },
            },
            { new: true }
        );
        res.json(post);
    } catch (error) {
        res.json(error);
    }
});

const updatePostController = expressAsyncHandler(async (req, res) => {
    // console.log(req.user);
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const post = await Post.findByIdAndUpdate(
            id,
            {
                ...req.body,
                user: req.user?._id,
            },
            {
                new: true,
            }
        );
        res.json(post);
    } catch (error) {
        res.json(error);
    }
});

const deletePostController = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    try {
        const post = await Post.findByIdAndDelete(id);
        res.json(post);
    } catch (error) {
        res.json(error);
    }
});

const likePostController = expressAsyncHandler(async (req, res) => {
    // console.log(req.user);

    //find the post to be liked
    const { postId } = req.body;
    const post = await Post.findById(postId);

    //find the login user
    const loginUserId = req?.user?._id;

    //find is this user has liked this post?
    const isLiked = post?.isLiked;

    //check if this user has dislike this post?
    const isDisLiked = post?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    //remove the user from dislikes array if exists
    if (isDisLiked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    dislikes: loginUserId,
                },
                isDisLiked: false,
            },
            {
                new: true,
            }
        );
        res.json(post);
    }

    //Toggle
    //Remove the user if s/he has liked the post
    if (isLiked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    likes: loginUserId,
                },
                isLiked: false,
            },
            { new: true }
        );
        res.json(post);
    } else {
        //add to likes
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    likes: loginUserId,
                },
                isLiked: true,
            },
            { new: true }
        );
        res.json(post);
    }
});

const dislikePostController = expressAsyncHandler(async (req, res) => {
    const { postId } = req.body;
    const post = await Post.findById(postId);

    //find the login user
    const loginUserId = req?.user?._id;

    //find is this user has disliked this post?
    const isDisLiked = post?.isDisLiked;

    //check if this user has like this post?
    const isLiked = post?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
    );

    if (isLiked) {
        const post = await Post.findByIdAndUpdate(postId, {
            $pull: {
                likes: loginUserId,
            },
            isLiked: false,
        });
        res.json(post);
    }

    //Toggle
    //Remove the user if s/he alreade disliked the post
    if (isDisLiked) {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    dislikes: loginUserId,
                },
                isDisLiked: false,
            },
            { new: true }
        );
        res.json(post);
    } else {
        // add to dislikes
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    dislikes: loginUserId,
                },
                isDisLiked: true,
            },
            { new: true }
        );
        res.json(post);
    }
});

module.exports = {
    createPostController,
    fetchAllPostsController,
    fetchSinglePostController,
    updatePostController,
    deletePostController,
    likePostController,
    dislikePostController,
};
