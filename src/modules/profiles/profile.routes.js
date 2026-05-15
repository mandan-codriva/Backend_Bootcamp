const express = require("express");

const upload = require("./profile.upload");

const authMiddleware = require("../../middleware/auth.middleware");

const profileController = require("./profile.controller");

const router = express.Router();

router.get("/", profileController.getAllProfiles);
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  profileController.updateAvatar
);



router.get("/:userId", profileController.getProfileByUserId);

module.exports = router;
