const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
// const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

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

app.use(cors());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/documents", documentRoutes);

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://adpem-jambiprov-go-id.vercel.app"
    );

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
