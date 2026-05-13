const pool = require("../../config/db");

const createSession = async (
  userId,
  refreshTokenHash,
  userAgent,
  ipAddress,
  expiresAt
) => {
  const query = `
    INSERT INTO sessions (
      user_id,
      refresh_token_hash,
      user_agent,
      ip_address,
      expires_at
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    userId,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};


const findSessionByToken = async (refreshTokenHash) =>{
  const query = `
    SELECT * FROM SESSIONS
    WHERE refresh_token_hash = $1
    AND is_revoked = FALSE
  `;
  const result = await pool.query(query,[refreshTokenHash]);
  return result.rows[0];
}

const updateSessionToken  = async (
  sessionId,
  newRefreshTokenHash,
  expiresAt

) =>{
  const query = 
  `UPDATE sessions
    SET 
      refresh_token_hash = $1,
      expires_at = $2
      WHERE id = $3
      RETURNING * `;
      const values = [
         newRefreshTokenHash,
         expiresAt,
         sessionId,
  ];
  const result = await pool.query(query,values);
   return result.rows[0];
};


const revokeSession = async (refreshTokenHash) =>{
  const query =  `
     UPDATE sessions 
     SET is_revoked  = TRUE
     WHERE refresh_token_hash = $1
     RETURNING *
  `;

  const result = await pool.query(query,[refreshTokenHash]);
  return result.rows[0];
}



module.exports = {
  createSession,
  findSessionByToken,
  updateSessionToken,
  revokeSession,
};

