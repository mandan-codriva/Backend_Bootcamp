const express = require("express");

const router = express.Router();

const postsController = require(
  "./posts.controller"
);

const upload = require(
  "./posts.upload"
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

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 */


// CREATE POST WITH MEDIA
router.post(
  "/",

  authMiddleware,

  upload.array("media", 10),

  createPostValidation,

  validateMiddleware,

  postsController.createPostController
);



// GET ALL POSTS
router.get(
  "/",
  postsController.getAllPostsController
);



// GET SINGLE POST
router.get(
  "/:id",
  postsController.getPostByIdController
);



// UPDATE POST
router.put(
  "/:id",

  authMiddleware,

  createPostValidation,

  validateMiddleware,

  postsController.updatePostController
);



// DELETE POST
router.delete(
  "/:id",

  authMiddleware,

  postsController.deletePostController
);

module.exports = router;
