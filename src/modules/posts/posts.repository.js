const pool = require("../../config/db");

const createPost = async (
  title,
  content,
  authorId
) => {
  const query = `
    INSERT INTO posts (
      title,
      content,
      author_id
    )
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [
    title,
    content,
    authorId,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const getAllPosts = async () => {
  const query = `
    SELECT
      posts.id,
      posts.title,
      posts.content,
      posts.created_at,

      users.id AS author_id,
      users.username AS author_name

    FROM posts

    JOIN users
    ON posts.author_id = users.id

    ORDER BY posts.created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getPostById = async (id) => {
  const query = `
    SELECT
      posts.id,
      posts.title,
      posts.content,
      posts.created_at,

      users.id AS author_id,
      users.username AS author_name

    FROM posts

    JOIN users
    ON posts.author_id = users.id

    WHERE posts.id = $1
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0];
};


const updatepost = async (
    id,
    title,
    content
) => {
    const query = `
      UPDATE posts
      SET 
      title = $1,
      content = $2,
      updated_at = now()

      WHERE id = $3

      RETURNING *

    `;
    const values = [title,content,id];
    const result = await pool.query(query,values);
    return result.rows[0];
};


const deletePost = async (id) => {
  const query = `
    DELETE FROM posts
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(
    query,
    [id]
  );

  return result.rows[0];
};



module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatepost,
  deletePost,
};