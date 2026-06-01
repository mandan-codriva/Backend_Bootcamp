const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/authorize.middleware");
const { ROLES } = require("../../config/roles");
const validateMiddleware = require("../../middleware/validate.middleware");

const {
  listUsersController,
  updateUserRoleController,
  moderateDeletePostController,
  moderateDeleteCommentController,
  getStatsController,
  getUserDetailController,
  updateUserDetailController,
} = require("./admin.controller");

const {
  adminUserIdParamValidation,
  adminPostIdParamValidation,
  adminCommentIdParamValidation,
  adminUpdateRoleBodyValidation,
  adminUpdateUserBodyValidation,
} = require("./admin.validation");

// Apply authentication globally to all admin routes
router.use(authMiddleware);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Retrieve list of registered users (Admin and User)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", authorize(ROLES.USER), listUsersController);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update a user's role (Admin-Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/users/:id/role",
  authorize(ROLES.ADMIN),
  adminUserIdParamValidation,
  adminUpdateRoleBodyValidation,
  validateMiddleware,
  updateUserRoleController
);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Retrieve detailed profile and posts of a user (Admin and User)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Detailed user profile and posts retrieved successfully
 *       404:
 *         description: User not found
 * 
 *   patch:
 *     summary: Update details of a user profile (Admin-Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true,
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               fullName:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully by admin
 *       404:
 *         description: User not found
 */
router.get(
  "/users/:id",
  authorize(ROLES.USER),
  adminUserIdParamValidation,
  validateMiddleware,
  getUserDetailController
);

router.patch(
  "/users/:id",
  authorize(ROLES.ADMIN),
  adminUserIdParamValidation,
  adminUpdateUserBodyValidation,
  validateMiddleware,
  updateUserDetailController
);

/**
 * @swagger
 * /admin/posts/{id}:
 *   delete:
 *     summary: Moderate and delete any post (Admin-Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/posts/:id",
  authorize(ROLES.ADMIN),
  adminPostIdParamValidation,
  validateMiddleware,
  moderateDeletePostController
);

/**
 * @swagger
 * /admin/comments/{id}:
 *   delete:
 *     summary: Moderate and delete any comment (Admin-Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/comments/:id",
  authorize(ROLES.ADMIN),
  adminCommentIdParamValidation,
  validateMiddleware,
  moderateDeleteCommentController
);

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get overall application statistics (Admin-Only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authorize(ROLES.ADMIN), getStatsController);

module.exports = router;
