const express = require("express");
const {
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
} = require("../../controllers/users/userController");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
    photoUploadMdw,
    profilePhotoResizeMdw,
} = require("../../middlewares/upload/photoUploadMdw");

const userRoutes = express.Router();

userRoutes.post("/register", userRegister);

userRoutes.post("/login", userLogin);

userRoutes.put(
    "/profile-photo-upload",
    authMiddleware,
    photoUploadMdw.single("image"),
    profilePhotoResizeMdw,
    profilePhotoUpload
);

userRoutes.get("/", authMiddleware, fetchUsers);

userRoutes.post("/forget-password-token", forgetPassword);

userRoutes.put("/reset-password", passwordReset);

userRoutes.put("/password", authMiddleware, updatePassword);

userRoutes.get("/profile/:id", authMiddleware, userProfile);

userRoutes.put("/follow", authMiddleware, followingUser);

userRoutes.put("/unfollow", authMiddleware, unfollowUser);

userRoutes.post(
    "/generate-verify-email-token",
    authMiddleware,
    generateEmailVerification
);

userRoutes.put("/verify-account", authMiddleware, accountVerification);

userRoutes.put("/block-user/:id", authMiddleware, blockUser);

userRoutes.put("/unblock-user/:id", authMiddleware, unBlockUser);

userRoutes.put("/:id", authMiddleware, updateUser);

userRoutes.delete("/:id", deleteUsers);

userRoutes.get("/:id", fetchUsersDetails);

module.exports = userRoutes;
