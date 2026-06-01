const { param } = require("express-validator");

const postIdParamValidation = [
  param("postId")
    .isUUID()
    .withMessage("Post ID must be a valid UUID"),
];

module.exports = {
  postIdParamValidation,
};
