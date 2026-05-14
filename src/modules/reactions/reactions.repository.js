const pool = require("../../config/db");

const findReaction = async (userId, postId) => {
  const query = `
       SELECT * FROM post_reactions
       WHERE user_id = $1
       AND post_id = $2

    `;
  const values = [userId, postId];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const createReaction = async ({ userId, postId, reactionType }) => {
  const query = `
   INSERT INTO post_reactions(
      user_id,
      post_id,
      reaction_type
    )
   VALUES($1,$2,$3)
   RETURNING *;
   `;

  const values = [userId, postId, reactionType];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const updateReaction = async (reactionId, reactionType) => {
  const query = `
    UPDATE post_reactions
    SET reaction_type = $1
    WHERE id = $2
    RETURNING *;
  `;

  const values = [reactionType, reactionId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteReaction = async (reactionId) => {
  const query = `
    DELETE FROM post_reactions
    WHERE id = $1
    RETURNING *;
  `;

  const values = [reactionId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getPostReactionCounts = async (postId) => {
  const query = `
    SELECT
  COUNT(*) FILTER (
    WHERE reaction_type = 'like'
  ) AS likes_count,

  COUNT(*) FILTER (
    WHERE reaction_type = 'dislike'
  ) AS dislikes_count

FROM post_reactions

WHERE post_id = $1;
    `;
  const values = [postId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  findReaction,
  createReaction,
  updateReaction,
  deleteReaction,
  getPostReactionCounts,
};
