const pool = require("../../config/db");

const createComment = async ({
  postId,
  userId,
  content,
  parentCommentId = null,
}) => {
  const query = `
    INSERT INTO comments (
      post_id,
      user_id,
      content,
      parent_comment_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    postId,
    userId,
    content,
    parentCommentId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const findCommentsByPostId = async (postId) => {
  const query = `
    SELECT
      comments.id,
      comments.content,
      comments.parent_comment_id,
      comments.created_at,
      comments.updated_at,

      users.id AS user_id,
      users.username

    FROM comments

    JOIN users
    ON comments.user_id = users.id

    WHERE comments.post_id = $1

    ORDER BY comments.created_at DESC;
  `;

  const values = [postId];

  const result = await pool.query(query, values);

  return result.rows;
};

const findCommentById = async (commentId) => {
  const query = `
    SELECT *
    FROM comments
    WHERE id = $1;
  `;

  const values = [commentId];

  const result = await pool.query(query, values);

  return result.rows[0];
};


const findRepliesByCommentId = async (
  commentId
) => {

  const query = `
    SELECT
      comments.id,
      comments.content,
      comments.parent_comment_id,
      comments.created_at,
      comments.updated_at,

      users.id AS user_id,
      users.username

    FROM comments

    JOIN users
    ON comments.user_id = users.id

    WHERE comments.parent_comment_id = $1

    ORDER BY comments.created_at ASC;
  `;

  const values = [commentId];

  const result = await pool.query(
    query,
    values
  );

  return result.rows;

};

const updateComment = async (
  commentId,
  content
) => {
  const query = `
    UPDATE comments
    SET
      content = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;

  const values = [content, commentId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteComment = async (commentId) => {
  const query = `
    DELETE FROM comments
    WHERE id = $1
    RETURNING *;
  `;

  const values = [commentId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

module.exports = {
  createComment,
  findCommentsByPostId,
  findCommentById,
  updateComment,
  deleteComment,
  findRepliesByCommentId,
};