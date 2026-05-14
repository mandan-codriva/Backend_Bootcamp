const { body, param } = require(
  "express-validator"
);

const toggleReactionValidation = [
  body("postId")
    .notEmpty()
    .withMessage("Post ID is required")
    .isInt()
    .withMessage(
      "Post ID must be an integer"
    ),

  body("reactionType")
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
    .isInt()
    .withMessage(
      "Post ID must be an integer"
    ),
];

module.exports = {
  toggleReactionValidation,
  postIdValidation,
};