const authService = require("./auth.service");

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

const loginController = async (req, res, next) => {
  try {
    const result = await authService.loginService(
      req.body,
      req
    );

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
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


const refreshController = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    const result =
      await authService.refreshService(
        refreshToken
      );

    // Set NEW rotated refresh token
    res.cookie(
      "refreshToken",
      result.refreshToken,
      {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge:
          7 * 24 * 60 * 60 * 1000,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Token refreshed successfully",
      data: {
        accessToken:
          result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logoutController = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      req.cookies.refreshToken;

    await authService.logoutService(
      refreshToken
    );

    // Clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
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
};

