const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    }
  );
};

const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};