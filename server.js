const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());

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

app.use(
    "/api/v1/users",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    userRoutes
);
app.use(
    "/api/v1/posts",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    postRoutes
);
app.use(
    "/api/v1/comments",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    commentRoutes
);
app.use(
    "/api/v1/email",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    emailRoutes
);
app.use(
    "/api/v1/category",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    categoryRoutes
);
app.use(
    "/api/v1/gallery",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    galleryRoutes
);
app.use(
    "/api/v1/documents",
    createProxyMiddleware({
        target: "https://adpem-jambiprov-go-id.vercel.app",
        changeOrigin: true,
    }),
    documentRoutes
);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
