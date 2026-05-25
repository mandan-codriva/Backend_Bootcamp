const pool = require("../../config/db");

const createPost = async (
  title,
  content,
  authorId,
  status = "draft",
  category = null
) => {
  const query = `
    INSERT INTO posts (
      title,
      content,
      author_id,
      status,
      category,
      published_at
    )
    VALUES ($1, $2, $3, $4::post_status, $5, CASE WHEN $4::text = 'published' THEN NOW() ELSE NULL END)
    RETURNING *
  `;

  const values = [
    title,
    content,
    authorId,
    status,
    category,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const getAllPosts = async (page, limit, search, category, userId, status = 'published', sortBy = 'created_at', sortOrder = 'DESC') => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      posts.id,
      posts.title,
      posts.content,
      posts.category,
      posts.status,
      posts.created_at,

      users.id AS author_id,
      users.username AS author_name,

      COALESCE(
        json_agg(
          jsonb_build_object(
            'id',  post_media.id,
            'url', post_media.media_url,
            'type', post_media.media_type
          )
        ) FILTER (WHERE post_media.id IS NOT NULL),
        '[]'
      ) AS media

    FROM posts

    JOIN users
      ON posts.author_id = users.id

    LEFT JOIN post_media
      ON posts.id = post_media.post_id

    WHERE (posts.title ILIKE $1 OR posts.content ILIKE $1)
  `;

  const values = [`%${search}%`];
  let paramIndex = 2;

  // Dynamically filter by status if provided
  if (status) {
    query += ` AND posts.status = $${paramIndex}::post_status`;
    values.push(status);
    paramIndex++;
  }

  if (category) {
    query += ` AND LOWER(posts.category) = LOWER($${paramIndex})`;
    values.push(category);
    paramIndex++;
  }

  if (userId) {
    query += ` AND posts.author_id = $${paramIndex}`;
    values.push(userId);
    paramIndex++;
  }

  query += `
    GROUP BY posts.id, users.id
    ORDER BY posts.${sortBy} ${sortOrder}
    LIMIT $${paramIndex}
    OFFSET $${paramIndex + 1}
  `;

  values.push(limit, offset);

  const result = await pool.query(query, values);

  return result.rows;
};

const totalPosts = async (search, category, userId, status) => {
  let query = `
    SELECT COUNT(*)
    FROM posts
    WHERE (title ILIKE $1 OR content ILIKE $1)
  `;
  const values = [`%${search}%`];
  let paramIndex = 2;

  if (status) {
    query += ` AND status = $${paramIndex}::post_status`;
    values.push(status);
    paramIndex++;
  }

  if (category) {
    query += ` AND LOWER(posts.category) = LOWER($${paramIndex}) `;
    values.push(category);
    paramIndex++;
  }

  if (userId) {
    query += ` AND posts.author_id = $${paramIndex}`;
    values.push(userId);
    paramIndex++;
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count || 0);
};

const getPostById = async (id) => {
  const query = `
    SELECT
      posts.id,
      posts.title,
      posts.content,
      posts.category,
      posts.status,
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
  content,
  status,
  category
) => {
  const query = `
      UPDATE posts
      SET 
      title = $1,
      content = $2,
      status = COALESCE($3::post_status, status),
      category = COALESCE($4, category),
      published_at = CASE 
        WHEN $3::text = 'published' AND (published_at IS NULL OR status != 'published') THEN NOW()
        ELSE published_at
      END,
      updated_at = now()

      WHERE id = $5

      RETURNING *

    `;
  const values = [title, content, status || null, category || null, id];
  const result = await pool.query(query, values);
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
  totalPosts,
};