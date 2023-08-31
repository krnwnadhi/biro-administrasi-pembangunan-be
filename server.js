const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const path = require("path");
const cors = require("cors");

const app = express();
const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/users/userRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const postRoutes = require("./routes/posts/postRoute");
const commentRoutes = require("./routes/comments/commentRoute");
const emailRoutes = require("./routes/email/emailRoute");
const categoryRoutes = require("./routes/category/categoryRoute");
const galleryRoutes = require("./routes/gallery/galleryRoute");
const documentRoutes = require("./routes/documents/documentRoute");

const PORT = process.env.PORT;

dbConnect();

//middleware
app.use(express.json({ limit: "5mb" }));
// app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.static(path.join(__dirname, "..", "build")));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/documents", documentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
