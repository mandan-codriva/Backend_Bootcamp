
const otpTemplate = (otp) => {
  return `
    <div style="font-family: Arial; padding: 20px;">
      
      <h2>Blog App Login Verification</h2>

      <p>Your OTP for login is:</p>

      <h1 style="
        letter-spacing: 6px;
        color: #2563eb;
      ">
        ${otp}
      </h1>

      <p>
        This OTP will expire in 5 minutes.
      </p>

    </div>
  `;
};

module.exports = otpTemplate;
