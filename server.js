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

var corsOptions = {
    origin: "https://adpem-jambiprov-go-id.vercel.app/",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use("/api/v1/users", cors(corsOptions), userRoutes);
app.use("/api/v1/posts", cors(corsOptions), postRoutes);
app.use("/api/v1/comments", cors(corsOptions), commentRoutes);
app.use("/api/v1/email", cors(corsOptions), emailRoutes);
app.use("/api/v1/category", cors(corsOptions), categoryRoutes);
app.use("/api/v1/gallery", cors(corsOptions), galleryRoutes);
app.use("/api/v1/documents", cors(corsOptions), documentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
