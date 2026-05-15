const bcrypt = require("bcrypt");

const profileRepository = require("../profiles/profile.repository");

const authRepository = require("./auth.repository");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/jwt");

const {
  verifyRefreshToken,
} = require("../../utils/jwt");

const { hashToken } = require("../../utils/hash");

const sessionRepository = require("./session.repository");

const signupService = async (userData) => {
  const { username, email, password } = userData;

  const existingUser =
    await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser(
    username,
    email,
    passwordHash
  );
   await profileRepository.createProfile(user.id);

  return user;
};

const loginService = async (userData, req) => {
  const { email, password } = userData;

  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  // Hash refresh token
  const refreshTokenHash = hashToken(refreshToken);

  // Create expiry date
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store session in database
  await sessionRepository.createSession(
    user.id,
    refreshTokenHash,
    req.headers["user-agent"],
    req.ip,
    expiresAt
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};


const refreshService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token missing");
  }

  // Verify JWT
  const decoded =
    verifyRefreshToken(refreshToken);

  // Hash incoming token
  const refreshTokenHash =
    hashToken(refreshToken);

  // Find session
  const session =
    await sessionRepository.findSessionByToken(
      refreshTokenHash
    );

  if (!session) {
    throw new Error("Invalid session");
  }

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    throw new Error("Session expired");
  }

  // Fetch latest user data
  const user =
    await authRepository.findUserById(
      decoded.id
    );

  if (!user) {
    throw new Error("User not found");
  }

  // Generate NEW access token
  const newAccessToken =
    generateAccessToken(user);

  // Generate NEW refresh token
  const newRefreshToken =
    generateRefreshToken({
      id: user.id,
    });

  // Hash new refresh token
  const newRefreshTokenHash =
    hashToken(newRefreshToken);

  // New expiry
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + 7
  );

  // Rotate session token
  await sessionRepository.updateSessionToken(
    session.id,
    newRefreshTokenHash,
    expiresAt
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
const logoutService = async (
  refreshToken
) => {
  if (!refreshToken) {
    throw new Error(
      "Refresh token missing"
    );
  }

  // Hash token
  const refreshTokenHash =
    hashToken(refreshToken);

  // Revoke session
  await sessionRepository.revokeSession(
    refreshTokenHash
  );

  return true;
};

module.exports = {
  signupService,
  loginService,
  refreshService,
  logoutService,
};