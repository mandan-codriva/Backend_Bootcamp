const express = require("express");

const authMiddleware = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorize.middleware");
const { ROLES } = require("../../config/roles");
const validateMiddleware = require("../../middleware/validate.middleware");
const { updateProfileValidation, userIdValidation } = require("./profile.validation");
const upload = require("../media/media.upload");

const profileController = require("./profile.controller");

const router = express.Router();

// Only logged-in users (or admins due to role hierarchy) can list other profiles
router.get(
  "/",
  authMiddleware,
  authorize(ROLES.USER),
  profileController.getAllProfiles
);

// Get the currently logged-in user's database profile
router.get(
  "/me",
  authMiddleware,
  profileController.getMyProfile
);

router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  profileController.updateAvatar
);

router.patch(
  "/",
  authMiddleware,
  updateProfileValidation,
  validateMiddleware,
  profileController.updateProfileDetails
);

router.get(
  "/:userId",
  userIdValidation,
  validateMiddleware,
  profileController.getProfileByUserId
);

module.exports = router;
