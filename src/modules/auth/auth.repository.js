const pool = require("../../config/db");

const createUser = async (username, email, passwordHash) => {
  const query = `
    INSERT INTO users(username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email, role
  `;

  const values = [username, email, passwordHash];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `
    SELECT 
      u.*,
      p.full_name,
      p.bio,
      p.avatar_url
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};
const findUserById = async (id) => {
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.role,
      p.full_name,
      p.bio,
      p.avatar_url
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};


const updateUserRole = async (userId, role) => {
  const query = `
    UPDATE users
    SET role = $2
    WHERE id = $1
    RETURNING id, username, email, role;
  `;

  const result = await pool.query(query, [userId, role.toLowerCase()]);
  return result.rows[0];
};


module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserRole,
};