const { body, param } = require(
  "express-validator"
);

const toggleReactionValidation = [
  body("postId")
    .trim()
    .notEmpty()
    .withMessage("Post ID is required")
    .isUUID()
    .withMessage(
      "Post ID must be a valid UUID"
    ),

  body("reactionType")
    .trim()
    .notEmpty()
    .withMessage(
      "Reaction type is required"
    )
    .isIn(["like", "dislike"])
    .withMessage(
      "Reaction type must be either like or dislike"
    ),
];

const postIdValidation = [
  param("postId")
    .isUUID()
    .withMessage(
      "Post ID must be a valid UUID"
    ),
];

module.exports = {
  toggleReactionValidation,
  postIdValidation,
};