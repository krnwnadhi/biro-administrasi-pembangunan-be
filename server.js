const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
// const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(
    cors({
        origin: "https://adpem-jambiprov-go-id.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

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

app.use(express.static(path.join(__dirname, "..", "build")));

app.get("/", (req, res) => {
    res.json({ msg: "Welcome to Biro Adpem API v1 ..." });
});

// const allowlist = ["https://adpem-jambiprov-go-id.vercel.app"];
// const corsOptionsDelegate = function (req, callback) {
//     let corsOptions;
//     if (allowlist.indexOf(req.header("Origin")) !== -1) {
//         corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
//     } else {
//         corsOptions = { origin: false }; // disable CORS for this request
//     }
//     callback(null, corsOptions); // callback expects two parameters: error and options
// };

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
