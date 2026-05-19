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
    SELECT * FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};
const findUserById = async (id) => {
  const query = `
    SELECT id, username, email, role
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};


const upgradeUserToCreator = async (
  userId
) => {

  const query = `
    UPDATE users
    SET role = 'creator'
    WHERE id = $1
    RETURNING id, username, email, role;
  `;

  const result = await pool.query(
    query,
    [userId]
  );

  return result.rows[0];
};


module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  upgradeUserToCreator,
};