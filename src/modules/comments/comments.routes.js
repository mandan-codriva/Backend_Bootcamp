const express = require("express");

const router = express.Router();

const {
  createCommentController,
  getCommentsByPostController,
  updateCommentController,
  deleteCommentController,
} = require("./comments.controller");

const {
  createCommentValidation,
  updateCommentValidation,
  commentIdValidation,
  postIdValidation,
} = require("./comments.validation");

const authMiddleware = require("../../middleware/auth.middleware");

const validateMiddleware = require("../../middleware/validate.middleware");

router.post(
  "/",
  authMiddleware,
  createCommentValidation,
  validateMiddleware,
  createCommentController
);

router.get(
  "/post/:postId",
  postIdValidation,
  validateMiddleware,
  getCommentsByPostController
);

router.patch(
  "/:commentId",
  authMiddleware,
  commentIdValidation,
  updateCommentValidation,
  validateMiddleware,
  updateCommentController
);

router.delete(
  "/:commentId",
  authMiddleware,
  commentIdValidation,
  validateMiddleware,
  deleteCommentController
);

module.exports = router;