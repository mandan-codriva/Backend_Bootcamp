const pool = require("../../config/db");

const getAllUsers = async (
  page = 1,
  limit = 10,
  search = null,
  sortBy = "id",
  sortOrder = "ASC"
) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT id, username, email, role, created_at
    FROM users
  `;
  const values = [limit, offset];
  let paramIndex = 3;

  if (search) {
    query += ` WHERE LOWER(username) LIKE LOWER($${paramIndex}) OR LOWER(email) LIKE LOWER($${paramIndex}) `;
    values.push(`%${search}%`);
    paramIndex++;
  }

  // Safe to interpolate because sortBy and sortOrder are whitelisted in the service layer
  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $1 OFFSET $2 `;

  const result = await pool.query(query, values);
  return result.rows;
};

const totalUsers = async (search = null) => {
  let query = `SELECT COUNT(*) FROM users`;
  const values = [];

  if (search) {
    query += ` WHERE LOWER(username) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1) `;
    values.push(`%${search}%`);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count, 10);
};

const getSystemStats = async () => {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*)::integer FROM users) as total_users,
      (SELECT COUNT(*)::integer FROM posts) as total_posts,
      (SELECT COUNT(*)::integer FROM comments) as total_comments,
      (SELECT COUNT(*)::integer FROM post_reactions WHERE reaction_type = 'like') as total_likes
  `;
  const result = await pool.query(statsQuery);
  return result.rows[0];
};

const getNewUsersPerMonthStats = async () => {
  const query = `
    SELECT 
      DATE_TRUNC('month', created_at) AS month,
      COUNT(*)::INTEGER AS count
    FROM users
    GROUP BY month
    ORDER BY month ASC;
  `;
  const result = await pool.query(query);
  return result.rows.map(row => ({
    month: row.month,
    count: row.count
  }));
};

const getNewBlogsPerMonthStats = async () => {
  const query = `
    SELECT 
      DATE_TRUNC('month', created_at) AS month,
      COUNT(*)::INTEGER AS count
    FROM posts
    GROUP BY month
    ORDER BY month ASC;
  `;
  const result = await pool.query(query);
  return result.rows.map(row => ({
    month: row.month,
    count: row.count
  }));
};

const getUserDetailForAdmin = async (userId) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.role, 
      u.created_at,
      p.full_name, 
      p.bio, 
      p.avatar_url,
      COALESCE((SELECT COUNT(*)::integer FROM posts WHERE author_id = u.id), 0) AS total_posts_created
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = $1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const getUserPostsForAdmin = async (userId) => {
  const query = `
    SELECT 
      p.id,
      p.title,
      p.status,
      p.published_at,
      p.created_at,

      COUNT(pr.id)::integer AS total_likes

    FROM posts p

    LEFT JOIN post_reactions pr
      ON pr.post_id = p.id
      AND pr.reaction_type = 'like'

    WHERE p.author_id = $1

    GROUP BY 
      p.id,
      p.title,
      p.status,
      p.published_at,
      p.created_at

    ORDER BY p.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

const adminUpdateUserAndProfile = async (userId, updateData) => {
  const { fullName, bio, avatarUrl } = updateData;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update profiles if fields are provided
    if (fullName !== undefined || bio !== undefined || avatarUrl !== undefined) {
      let profileFields = [];
      let profileValues = [];
      let idx = 1;

      if (fullName !== undefined) {
        profileFields.push(`full_name = $${idx++}`);
        profileValues.push(fullName);
      }
      if (bio !== undefined) {
        profileFields.push(`bio = $${idx++}`);
        profileValues.push(bio);
      }
      if (avatarUrl !== undefined) {
        profileFields.push(`avatar_url = $${idx++}`);
        profileValues.push(avatarUrl);
      }

      profileValues.push(userId);
      const profileQuery = `
        UPDATE profiles 
        SET ${profileFields.join(", ")} 
        WHERE user_id = $${idx}
        RETURNING *;
      `;
      await client.query(profileQuery, profileValues);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getAllUsers,
  totalUsers,
  getSystemStats,
  getNewUsersPerMonthStats,
  getNewBlogsPerMonthStats,
  getUserDetailForAdmin,
  getUserPostsForAdmin,
  adminUpdateUserAndProfile,
};
