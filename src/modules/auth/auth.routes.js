const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");

const verifyOtpValidation = require("./auth.validation").verifyOtpValidation;

const {
  signupValidation,
  loginValidation,
} = require("./auth.validation");

const validateMiddleware = require("../../middleware/validate.middleware");

router.post("/signup", signupValidation, validateMiddleware, authController.signupController);

router.post("/login",loginValidation,validateMiddleware,authController.loginController);

router.post("/verify-otp",verifyOtpValidation,validateMiddleware,authController.verifyOtpController);




router.post(
  "/refresh",
  authController.refreshController
);

router.post(
  "/logout",
  authController.logoutController
);



module.exports = router;