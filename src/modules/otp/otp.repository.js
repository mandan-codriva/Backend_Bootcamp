
const pool = require("../../config/db");

const deleteExistingOtp = async (
  userId,
  purpose
) => {
  const query = `
    DELETE FROM otp_codes
    WHERE user_id = $1
    AND purpose = $2;
  `;

  await pool.query(query, [
    userId,
    purpose,
  ]);
};

const createOtp = async ({
  userId,
  otpHash,
  purpose,
  expiresAt,
}) => {
  const query = `
    INSERT INTO otp_codes (
      user_id,
      otp_hash,
      purpose,
      expires_at
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    userId,
    otpHash,
    purpose,
    expiresAt,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const getOtpByUserId = async (
  userId,
  purpose
) => {
  const query = `
    SELECT *
    FROM otp_codes
    WHERE user_id = $1
    AND purpose = $2
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const result = await pool.query(
    query,
    [userId, purpose]
  );

  return result.rows[0];
};

const deleteOtpById = async (id) => {
  const query = `
    DELETE FROM otp_codes
    WHERE id = $1;
  `;

  await pool.query(query, [id]);
};

module.exports = {
  deleteExistingOtp,
  createOtp,
  getOtpByUserId,
  deleteOtpById,
};

