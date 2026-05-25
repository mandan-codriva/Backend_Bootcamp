
const pool = require("../../config/db");

const createSubscription = async ({
  creatorId,
  subscriberId,
}) => {

  const query = `
    INSERT INTO subscribers (
      creator_id,
      subscriber_id
    )
    VALUES ($1, $2)
    RETURNING *;
  `;

  const values = [
    creatorId,
    subscriberId,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const findSubscription = async ({
  creatorId,
  subscriberId,
}) => {

  const query = `
    SELECT *
    FROM subscribers
    WHERE creator_id = $1
    AND subscriber_id = $2;
  `;

  const values = [
    creatorId,
    subscriberId,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const deleteSubscription = async ({
  creatorId,
  subscriberId,
}) => {

  const query = `
    DELETE FROM subscribers
    WHERE creator_id = $1
    AND subscriber_id = $2
    RETURNING *;
  `;

  const values = [
    creatorId,
    subscriberId,
  ];

  const result = await pool.query(
    query,
    values
  );

  return result.rows[0];
};

const getSubscriberCount = async (
  creatorId
) => {

  const query = `
    SELECT COUNT(*)::INTEGER AS count
    FROM subscribers
    WHERE creator_id = $1;
  `;

  const result = await pool.query(
    query,
    [creatorId]
  );

  return result.rows[0].count;
};

const getCreatorSubscribers =
  async ({
    creatorId,
    page,
    limit,
    sortBy = "subscribers.created_at",
    sortOrder = "DESC",
  }) => {

    const offset =
      (page - 1) * limit;

    const query = `
      SELECT
        users.id,
        users.username,
        profiles.avatar_url,
        subscribers.created_at

      FROM subscribers

      JOIN users
      ON subscribers.subscriber_id = users.id

      LEFT JOIN profiles
      ON users.id = profiles.user_id

      WHERE subscribers.creator_id = $1

      ORDER BY ${sortBy} ${sortOrder}

      LIMIT $2
      OFFSET $3;
    `;

    const values = [
      creatorId,
      limit,
      offset,
    ];

    const result = await pool.query(
      query,
      values
    );

    return result.rows;
};

module.exports = {
  createSubscription,
  findSubscription,
  deleteSubscription,
  getSubscriberCount,
  getCreatorSubscribers,
};
