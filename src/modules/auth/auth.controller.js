const authService = require("./auth.service");

// Dynamic cookie settings based on environment
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV && process.env.NODE_ENV.trim() === "production",
  sameSite: process.env.NODE_ENV && process.env.NODE_ENV.trim() === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Reusable helper to extract refresh token from multiple sources
const extractRefreshToken = (req) => {
  return (
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers["x-refresh-token"] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null)
  );
};

const signupController = async (req, res, next) => {
  try {
    const user = await authService.signupService(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtpController = async (req, res, next) => {
  try {
    const result = await authService.verifyOtpLoginService({
      ...req.body,
      req,
    });

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const result = await authService.loginService(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const refreshController = async (req, res, next) => {
  try {
    const refreshToken = extractRefreshToken(req);
    const result = await authService.refreshService(refreshToken);

    // Set NEW rotated refresh token
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutController = async (req, res, next) => {
  try {
    const refreshToken = extractRefreshToken(req);
    await authService.logoutService(refreshToken);

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signupController,
  loginController,
  refreshController,
  logoutController,
  verifyOtpController,
};

