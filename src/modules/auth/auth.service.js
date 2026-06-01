const bcrypt = require("bcrypt");
const authRepository = require("./auth.repository");
const profileRepository = require("../profiles/profile.repository");
const otpService = require("../otp/otp.service");
const sessionRepository = require("./session.repository");
const AppError = require("../../utils/appError");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");
const { hashToken } = require("../../utils/hash");
const sendEmail = require("../../utils/mail");
const otpTemplate = require("../../utils/otpTemplate");

const signupService = async (userData) => {
  const { username, email, password } = userData;

  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authRepository.createUser(
    username,
    email,
    passwordHash
  );

  // Auto create profile
  await profileRepository.createProfile(user.id);

  return user;
};

const loginService = async (userData) => {
  const { email, password } = userData;

  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password_hash
  );
  if (!isPasswordMatched) {
    throw new AppError("Invalid credentials", 401);
  }

  // Create OTP
  const otp = await otpService.createOtpService({
    userId: user.id,
    purpose: "LOGIN_2FA",
  });

  // Send OTP Email
  await sendEmail({
    to: user.email,
    subject: "Your Login OTP",
    html: otpTemplate(otp),
  });

  const response = {
    success: true,
    message: "OTP sent successfully",
    userId: user.id,
  };

  const isProd = process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production';
  if (!isProd) {
    response.otp = otp;
  }

  return response;
};

const verifyOtpLoginService = async ({
  userId,
  otp,
  req,
}) => {
  // Verify OTP
  await otpService.verifyOtpService({
    userId,
    otp,
    purpose: "LOGIN_2FA",
  });

  // Fetch user
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshToken = generateRefreshToken({ id: user.id });

  // Hash refresh token
  const refreshTokenHash = hashToken(refreshToken);

  // Session expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store session
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
      fullName: user.full_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
    },
  };
};

const refreshService = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token missing");
    error.status = 400;
    throw error;
  }

  // Verify JWT
  const decoded = verifyRefreshToken(refreshToken);

  // Hash incoming token
  const refreshTokenHash = hashToken(refreshToken);

  // Find session
  const session = await sessionRepository.findSessionByToken(refreshTokenHash);
  if (!session) {
    const error = new Error("Invalid session");
    error.status = 401;
    throw error;
  }

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    const error = new Error("Session expired");
    error.status = 401;
    throw error;
  }

  // Fetch latest user
  const user = await authRepository.findUserById(decoded.id);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user);

  // Generate new refresh token
  const newRefreshToken = generateRefreshToken({ id: user.id });

  // Hash new refresh token
  const newRefreshTokenHash = hashToken(newRefreshToken);

  // New expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Rotate session
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

const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token missing");
    error.status = 400;
    throw error;
  }

  // Hash token
  const refreshTokenHash = hashToken(refreshToken);

  // Revoke session
  await sessionRepository.revokeSession(refreshTokenHash);

  return true;
};

module.exports = {
  signupService,
  loginService,
  verifyOtpLoginService,
  refreshService,
  logoutService,
};

