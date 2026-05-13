const express = require("express");

const router = express.Router();

const postsController = require(
  "./posts.controller"
);

const authMiddleware = require(
  "../../middleware/auth.middleware"
);

const validateMiddleware = require(
  "../../middleware/validate.middleware"
);

const {
  createPostValidation,
} = require("./posts.validation");

router.post(
  "/",
  authMiddleware,
  createPostValidation,
  validateMiddleware,
  postsController.createPostController
);

router.get(
  "/",
  postsController.getAllPostsController
);

router.get(
  "/:id",
  postsController.getPostByIdController
);
router.put(
  "/:id",
  authMiddleware,
  createPostValidation,
  validateMiddleware,
  postsController.updatePostController
);

router.delete(
  "/:id",
  authMiddleware,
  postsController.deletePostController
);

module.exports = router;