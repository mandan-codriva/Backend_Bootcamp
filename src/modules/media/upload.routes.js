
const express = require("express");

const router = express.Router();

const upload = require(
    "./media.upload"
);

const mediaController = require(
    "./media.controller"
);
const authMiddleware = require("../../middleware/auth.middleware");

router.post(
    "/upload",
    authMiddleware, // <-- Protect the route and populate req.user
    upload.single("file"),
    mediaController.uploadMedia
);

router.get("/get/profile", authMiddleware, mediaController.getProfileMedia);

module.exports = router;

