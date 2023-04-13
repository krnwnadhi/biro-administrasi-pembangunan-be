const User = require("../../models/user/User");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../../config/token/generateToken");
const validateMongodbId = require("../../utils/validateMongodbID");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const cloudinary = require("../../utils/cloudinary");
const fs = require("fs");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userRegister = expressAsyncHandler(async (req, res) => {
    //check if user is already registered
    const userExists = await User.findOne({ email: req?.body?.email });

    if (userExists) throw new Error("Email sudah terdaftar.");

    try {
        const user = await User.create({
            fullName: req?.body?.fullName,
            email: req?.body?.email,
            password: req?.body?.password,
        });
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

const userLogin = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //Check if user is exist
    const userFound = await User.findOne({ email });

    //check if password is match
    if (userFound && (await userFound.isPasswordMatch(password))) {
        res.json({
            _id: userFound?._id,
            fullName: userFound?.fullName,
            email: userFound?.email,
            profilePhoto: userFound?.profilePhoto,
            isAdmin: userFound?.isAdmin,
            token: generateToken(userFound?._id),
        });
    } else {
        res.status(401);
        throw new Error("Data tidak ditemukan. Email/Password salah");
    }
});

const fetchUsers = expressAsyncHandler(async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.json(error);
    }
});

const deleteUsers = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    //check if user valid
    validateMongodbId(id);

    try {
        const deletedUsers = await User.findByIdAndDelete(id);
        res.json(deletedUsers);
    } catch (error) {
        res.json(error);
    }
});

const fetchUsersDetails = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    // check if user id is valid
    validateMongodbId(id);

    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        res.json(error);
    }
});

const userProfile = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    // check if user id is valid
    validateMongodbId(id);

    try {
        const myProfile = await User.findById(id).populate("posts");
        res.json(myProfile);
    } catch (error) {
        res.json(error);
    }
});

const updateUser = expressAsyncHandler(async (req, res) => {
    const { id } = req?.user;

    validateMongodbId(id);

    const user = await User.findByIdAndUpdate(
        id,
        {
            fullName: req?.body?.fullName,
            email: req?.body?.email,
            bio: req?.body?.bio,
        },
        {
            new: true,
            runValidators: true,
        }
    );
    res.json(user);
});

const updatePassword = expressAsyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;

    console.log(_id, password);

    validateMongodbId(_id);

    //Find the user by _id
    const user = await User.findById(_id);

    if (password) {
        user.password = password;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.json(user);
    }
});

const followingUser = expressAsyncHandler(async (req, res) => {
    const { followId } = req.body;
    const loginUserId = req.user.id;

    //find the target user & check if the login id exist
    const targetUser = await User.findById(followId);

    const alreadyFollowing = targetUser?.followers?.find(
        (user) => user?.toString() === loginUserId.toString()
    );

    if (alreadyFollowing) throw new Error("Kamu telah memfollow user ini");

    //find the user you want to follow and update its followers field
    await User.findByIdAndUpdate(
        followId,
        {
            $push: { followers: loginUserId },
            isFollowing: true,
        },
        { new: true }
    );

    //update the login user following field
    await User.findByIdAndUpdate(
        loginUserId,
        {
            $push: { following: followId },
        },
        { new: true }
    );

    res.json("You followed this user");
});

const unfollowUser = expressAsyncHandler(async (req, res) => {
    const { unFollowId } = req.body;
    const loginUserId = req.user.id;

    await User.findByIdAndUpdate(
        unFollowId,
        {
            $pull: { followers: loginUserId },
            isFollowing: false,
        },
        { new: true }
    );

    await User.findByIdAndUpdate(
        loginUserId,
        {
            $pull: { following: unFollowId },
        },
        { new: true }
    );
    res.json("You unfollowed this user");
});

const blockUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    const user = await User.findByIdAndUpdate(
        id,
        {
            isBlocked: true,
        },
        {
            new: true,
        }
    );
    res.json(user);
});

const unBlockUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);

    const user = await User.findByIdAndUpdate(
        id,
        {
            isBlocked: false,
        },
        {
            new: true,
        }
    );
    res.json(user);
});

const generateEmailVerification = expressAsyncHandler(async (req, res) => {
    const loginUser = req.user.id;

    const user = await User.findById(loginUser);
    // console.log(user);

    try {
        const verificationToken = await user.createAccountVerficationToken();

        //save user account information
        await user.save();

        console.log(verificationToken);

        const resetURL = `If you were requested to verify your account, verify now within 3 minutes, otherwise ignore this message <a href="http://localhost:3333/verify-account/${verificationToken}">Verify Account</a>`;

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_ADDRESS_PASSWORD,
            },
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: { rejectUnauthorized: false },
        });

        let msg = {
            from: "adhikurniawan2108@gmail.com",
            to: "adhi.onepiece@yahoo.co.id",
            subject: "Verify Your Account",
            html: resetURL,
        };

        await transporter.sendMail(msg);

        res.json(resetURL);
    } catch (error) {
        res.json(error);
    }

    // let config = {
    //     service: "gmail",
    //     auth: {
    //         user: process.env.EMAIL_ADDRESS,
    //         pass: process.env.EMAIL_ADDRESS_PASSWORD,
    //     },
    //     tls: { rejectUnauthorized: false },
    // };

    // let transporter = nodemailer.createTransport(config);

    // let MailGenerator = new Mailgen({
    //     theme: "default",
    //     product: {
    //         name: "Mailgen",
    //         link: "https://mailgen.js/",
    //     },
    // });

    // let response = {
    //     body: {
    //         name: "Administrasi Pembangunan",
    //         intro: "Change Your Password",
    //         table: {
    //             data: [
    //                 {
    //                     item: "Nodemailer Stack Book",
    //                     description: "A Backend application",
    //                     price: "$10.99",
    //                 },
    //             ],
    //         },
    //         outro: "Looking forward to do more business",
    //     },
    // };

    // let mail = MailGenerator.generate(response);

    // let message = {
    //     from: process.env.EMAIL_ADDRESS,
    //     to: userEmail,
    //     subject: "Change your password",
    //     html: mail,
    // };

    // transporter
    //     .sendMail(message)
    //     .then(() => {
    //         return res.status(201).json({
    //             msg: "You have received an email",
    //         });
    //     })
    //     .catch((err) => {
    //         return res.status(500).json({ err });
    //     });
});

const accountVerification = expressAsyncHandler(async (req, res) => {
    const { token } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    //find this user by token
    const userFound = await User.findOne({
        AccountVerificationToken: hashedToken,
        AccountVerificationTokenExpires: { $gt: new Date() },
    });

    if (!userFound) throw new Error("Token Kadaluarsa, mohon coba lagi");

    //update the property to true
    userFound.isAccountVerified = true;
    userFound.AccountVerificationToken = undefined;
    userFound.AccountVerificationTokenExpires = undefined;

    await userFound.save();

    res.json(userFound);
});

const forgetPassword = expressAsyncHandler(async (req, res) => {
    //find user by email
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Email tidak ditemukan");

    try {
        const token = await user.createPasswordResetToken();
        console.log(token);
        await user.save();

        const resetURL = `If you were requested to reset your password, reset now within 3 minutes, otherwise ignore this message <a href="http://localhost:3333/reset-password/${token}">Reset Password</a>`;

        let msg = {
            from: "adhikurniawan2108@gmail.com",
            to: email,
            subject: "Reset Your Password",
            html: resetURL,
        };

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_ADDRESS,
                pass: process.env.EMAIL_ADDRESS_PASSWORD,
            },
            port: 587,
            secure: false, // true for 465, false for other ports
            tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail(msg);

        res.json({
            msg: `A verification message is successfully sent to ${user?.email}. ${resetURL}`,
        });
    } catch (error) {
        res.json(error);
    }
});

const passwordReset = expressAsyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");

    //find this user by token
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) throw new Error("Token kadaluarsa, mohon coba lagi");

    //update password field
    user.password = password;
    user.passwordReset = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json(user);
});

//photo upload
const profilePhotoUpload = expressAsyncHandler(async (req, res) => {
    const { _id } = req.user;

    // get the path to image
    const localPath = `public/images/profile/${req.file.filename}`;

    //upload to cloudinary
    const imgUploaded = await cloudinary.cloudinaryUploadImage(localPath);
    // console.log(imgUploaded);

    const foundUser = await User.findByIdAndUpdate(
        _id,
        {
            profilePhoto: imgUploaded.url,
        },
        {
            new: true,
        }
    );
    //remove the saved image on folder
    fs.unlinkSync(localPath);

    res.json(foundUser);
});

module.exports = {
    userRegister,
    userLogin,
    fetchUsers,
    deleteUsers,
    fetchUsersDetails,
    userProfile,
    updateUser,
    updatePassword,
    followingUser,
    unfollowUser,
    blockUser,
    unBlockUser,
    generateEmailVerification,
    accountVerification,
    forgetPassword,
    passwordReset,
    profilePhotoUpload,
};
