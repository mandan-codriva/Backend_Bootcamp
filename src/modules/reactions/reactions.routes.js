const express = require("express");

const router = express.Router();

const {
  toggleReactionController,
  getReactionCountsController,
} = require("./reactions.controller");

const {
  toggleReactionValidation,
  postIdValidation,
} = require("./reactions.validation");

const authMiddleware = require(
  "../../middleware/auth.middleware"
);

const validateMiddleware = require(
  "../../middleware/validate.middleware"
);

router.post(
  "/",
  authMiddleware,
  toggleReactionValidation,
  validateMiddleware,
  toggleReactionController
);

router.get(
  "/post/:postId",
  postIdValidation,
  validateMiddleware,
  getReactionCountsController
);

module.exports = router;