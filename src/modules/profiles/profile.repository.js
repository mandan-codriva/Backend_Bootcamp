
const pool = require("../../config/db");

const createProfile = async (userId) => {
  const query = `
    INSERT INTO profiles (
      user_id
    )
    VALUES ($1)
    RETURNING *;
  `;

  const values = [userId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllProfiles = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    role = null,
    search = null,
    sortBy = "profiles.created_at",
    sortOrder = "DESC"
  } = options;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      users.id,
      users.username,
      users.role,
      profiles.full_name,
      profiles.bio,
      profiles.avatar_url,
      COALESCE((SELECT COUNT(*)::integer FROM subscribers WHERE creator_id = users.id), 0) AS followers_count,
      COALESCE((SELECT COUNT(*)::integer FROM post_reactions pr JOIN posts p ON pr.post_id = p.id WHERE p.author_id = users.id AND pr.reaction_type = 'like'), 0) AS likes_count
    FROM users
    LEFT JOIN profiles
    ON users.id = profiles.user_id
  `;

  const values = [];
  const conditions = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`LOWER(users.role) = $${paramIndex}`);
    values.push(role.toLowerCase());
    paramIndex++;
  }

  if (search) {
    conditions.push(`(LOWER(users.username) LIKE LOWER($${paramIndex}) OR LOWER(profiles.full_name) LIKE LOWER($${paramIndex}) OR LOWER(users.email) LIKE LOWER($${paramIndex}))`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")} `;
  }

  // Safe to interpolate because sortBy and sortOrder are whitelisted/normalized in service
  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1} `;
  values.push(limit, offset);

  const result = await pool.query(query, values);
  return result.rows;
};

const totalProfiles = async (options = {}) => {
  const { role = null, search = null } = options;

  let query = `
    SELECT COUNT(*) 
    FROM users
    LEFT JOIN profiles ON users.id = profiles.user_id
  `;

  const values = [];
  const conditions = [];
  let paramIndex = 1;

  if (role) {
    conditions.push(`LOWER(users.role) = $${paramIndex}`);
    values.push(role.toLowerCase());
    paramIndex++;
  }

  if (search) {
    conditions.push(`(LOWER(users.username) LIKE LOWER($${paramIndex}) OR LOWER(profiles.full_name) LIKE LOWER($${paramIndex}) OR LOWER(users.email) LIKE LOWER($${paramIndex}))`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")} `;
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count, 10);
};

const getProfileByUserId = async (userId) => {
  const query = `
    SELECT
      users.id,
      users.username,
      profiles.full_name,
      profiles.bio,
      profiles.avatar_url,
      COALESCE((SELECT COUNT(*)::integer FROM subscribers WHERE creator_id = users.id), 0) AS followers_count,
      COALESCE((SELECT COUNT(*)::integer FROM post_reactions pr JOIN posts p ON pr.post_id = p.id WHERE p.author_id = users.id AND pr.reaction_type = 'like'), 0) AS likes_count
    FROM users
    LEFT JOIN profiles
    ON users.id = profiles.user_id
    WHERE users.id = $1;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0];
};

const updateAvatar = async (userId, avatarUrl) => {
  const query = `
    UPDATE profiles
    SET avatar_url = $1,
        updated_at = NOW()
    WHERE user_id = $2
    RETURNING *;
  `;

  const values = [avatarUrl, userId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const updateProfileDetails = async (userId, { fullName, bio }) => {
  const updates = [];
  const values = [];
  let index = 1;

  if (fullName !== undefined) {
    updates.push(`full_name = $${index++}`);
    values.push(fullName);
  }
  if (bio !== undefined) {
    updates.push(`bio = $${index++}`);
    values.push(bio);
  }

  if (updates.length === 0) {
    return await getProfileByUserId(userId);
  }

  values.push(userId);
  const query = `
    UPDATE profiles
    SET ${updates.join(", ")},
        updated_at = NOW()
    WHERE user_id = $${index}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createProfile,
  getAllProfiles,
  totalProfiles,
  getProfileByUserId,
  updateAvatar,
  updateProfileDetails,
};
