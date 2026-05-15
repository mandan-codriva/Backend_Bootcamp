
const pool = require("../../config/db");

const createProfile = async (userId) => {
  const query = `
    INSERT INTO profiles (
      user_id,
      followers_count,
      likes_count
    )
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const values = [userId, 120, 450];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllProfiles = async () => {
  const query = `
    SELECT
      users.id,
      users.username,
      profiles.full_name,
      profiles.bio,
      profiles.avatar_url,
      profiles.followers_count,
      profiles.likes_count
    FROM users
    LEFT JOIN profiles
    ON users.id = profiles.user_id
    ORDER BY profiles.created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
};

const getProfileByUserId = async (userId) => {
  const query = `
    SELECT
      users.id,
      users.username,
      profiles.full_name,
      profiles.bio,
      profiles.avatar_url,
      profiles.followers_count,
      profiles.likes_count
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

module.exports = {
  createProfile,
  getAllProfiles,
  getProfileByUserId,
  updateAvatar,
};
