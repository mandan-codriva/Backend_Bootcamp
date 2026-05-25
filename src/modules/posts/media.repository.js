const pool = require("../../config/db");

const createPostMedia = async ({
  postId,
  mediaUrl,
  mediaType,
}) => {

  const query = `
    INSERT INTO post_media (
      post_id,
      media_url,
      media_type
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [
    postId,
    mediaUrl,
    mediaType,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const getMediaByPostId = async (
  postId
) => {

  const query = `
    SELECT *
    FROM post_media
    WHERE post_id = $1
    ORDER BY created_at ASC;
  `;

  const values = [postId];

  const result = await pool.query(
    query,
    values
  );

  return result.rows;
};

const getDocumentById = async (
  id
) => {

  const query = `
    SELECT *
    FROM documents
    WHERE id = $1;
  `;

  const values = [id];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

module.exports = {
  createPostMedia,
  getMediaByPostId,
  getDocumentById,
};
