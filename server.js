const express = require("express");
const dbConnect = require("./config/db/dbConnect");

const app = express();
const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/users/userRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const postRoutes = require("./routes/posts/postRoute");
const commentRoutes = require("./routes/comments/commentRoute");
const emailRoutes = require("./routes/email/emailRoute");
const categoryRoutes = require("./routes/category/categoryRoute");
const cors = require("cors");

const PORT = process.env.PORT;

dbConnect();

//middleware
app.use(express.json());

app.use(cors());

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/category", categoryRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}/`));
