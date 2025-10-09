const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { google } = require("googleapis");
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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({
        msg: "Welcome to API WEB Biro Adpem Setda Provinsi Jambi v1.2.0",
    });
});

app.use(cors());

// Inisialisasi service YouTube
const youtube = google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
});

// Endpoint API yang sudah dimodifikasi
app.get("/api/videos", async (req, res) => {
    try {
        // 1. Tentukan ID Channel yang ingin Anda targetkan
        const channelId = process.env.YOUTUBE_CHANNEL_ID_KEY;

        // 2. PANGGILAN API PERTAMA: Dapatkan detail channel untuk menemukan ID playlist "uploads"
        const channelResponse = await youtube.channels.list({
            part: "contentDetails", // Bagian ini berisi info tentang playlist terkait
            id: channelId,
        });

        // Cek jika channel ditemukan
        if (
            !channelResponse.data.items ||
            channelResponse.data.items.length === 0
        ) {
            return res.status(404).json({ error: "Channel tidak ditemukan." });
        }

        // Ambil ID playlist "uploads" dari respons
        const playlistId =
            channelResponse.data.items[0].contentDetails.relatedPlaylists
                .uploads;

        // 3. PANGGILAN API KEDUA: Gunakan playlistId untuk mendapatkan 2 video terbaru
        const playlistResponse = await youtube.playlistItems.list({
            part: "snippet",
            playlistId: playlistId,
            maxResults: 2,
        });

        // 4. Ubah format data agar sesuai dengan frontend
        const videos = playlistResponse.data.items.map((item, index) => ({
            id: index,
            title: item.snippet.title,
            youtubeId: item.snippet.resourceId.videoId,
        }));

        res.json(videos);
    } catch (error) {
        console.error("Error saat mengambil data YouTube:", error.message);
        res.status(500).json({ error: "Gagal mengambil video dari YouTube" });
    }
});

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
        "https://adpem.jambiprov.go.id"
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
