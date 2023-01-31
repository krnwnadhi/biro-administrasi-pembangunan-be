const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            required: [true, "Fullname is required"],
            type: String,
        },
        profilePhoto: {
            type: String,
            default:
                "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049__340.png",
        },
        email: {
            type: String,
            required: [true, "Email is required"],
        },
        password: {
            type: String,
            required: [true, "Passwords is required"],
        },
        bio: {
            type: String,
        },
        postCount: {
            type: Number,
            default: 0,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ["Super Admin", "Admin"],
        },
        isFollowing: {
            type: Boolean,
            default: false,
        },
        isUnFollowing: {
            type: Boolean,
            default: false,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        AccountVerificationToken: String,
        AccountVerificationTokenExpires: {
            type: Date,
        },
        viewedBy: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        following: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            ],
        },
        passwordChangeAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: false,
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

//virtual methods to populate created post
userSchema.virtual("posts", {
    ref: "Post",
    foreignField: "user",
    localField: "_id",
});

//middleware hash Paswords
userSchema.pre("save", async function (req, res, next) {
    if (!this.isModified("password")) {
        next();
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//match password
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//verify account
userSchema.methods.createAccountVerficationToken = async function () {
    // create token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    //save to db
    this.AccountVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    this.AccountVerificationTokenExpires = Date.now() + 3 * 60 * 1000; //3 Minutes

    return verificationToken;
};

//forget password
userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    // console.log({ resetToken });

    //save to db
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 3 * 60 * 1000; // 3 minutes

    return resetToken;
};

//compile schema into model
const User = mongoose.model("User", userSchema);

module.exports = User;
