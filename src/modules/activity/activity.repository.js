
const pool = require("../../config/db");

const createActivity = async ({
  userId,
  activityType,
  entityId = null,
  entityType = null,
  metadata = {},
}) => {
  const query = `
    INSERT INTO activity_logs (
      user_id,
      activity_type,
      entity_id,
      entity_type,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    userId,
    activityType,
    entityId,
    entityType,
    metadata,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getRecentActivitiesByUser = async (
  userId,
  limit = 20
) => {
  const query = `
    SELECT *
    FROM activity_logs
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;

  const values = [userId, limit];

  const result = await pool.query(query, values);

  return result.rows;
};

module.exports = {
  createActivity,
  getRecentActivitiesByUser,
};

