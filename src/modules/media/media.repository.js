const db = require("../../config/db");

const createDocument = async (
  data
) => {

  const query = `
    INSERT INTO documents (
      original_name,
      file_name,
      mime_type,
      file_size,
      file_url,
      folder,
      uploaded_by
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
  `;

  const values = [
    data.original_name,
    data.file_name,
    data.mime_type,
    data.file_size,
    data.file_url,
    data.folder,
    data.uploaded_by,
  ];

  const result = await db.query(
    query,
    values
  );

  return result.rows[0];
};

const getDocumentsByUser = async (userId) => {
  const query = `
    SELECT * FROM documents
    WHERE uploaded_by = $1
    ORDER BY created_at DESC;
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

module.exports = {
  createDocument,
  getDocumentsByUser,
};