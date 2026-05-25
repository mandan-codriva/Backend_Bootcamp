const multer = require("multer");

const path = require("path");

const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        let folder = "uploads/images";

        if (file.mimetype.startsWith("video")) {
            folder = "uploads/videos";
        }

        if (
            file.mimetype === "application/pdf"
        ) {
            folder = "uploads/documents";
        }

        fs.mkdirSync(folder, {
            recursive: true,
        });

        cb(null, folder);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
        "video/mp4",
        "application/pdf",
    ];

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error("Unsupported file type"),
            false
        );
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize:
            1024 * 1024 * 20,
    },
    fileFilter,
});

module.exports = upload;