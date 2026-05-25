
const bcrypt = require("bcrypt");

const otpRepository = require("./otp.repository");

const generateOtp = require("../../utils/generateOtp");

const createOtpService = async ({
    userId,
    purpose,
}) => {

    // Remove old OTPs
    await otpRepository.deleteExistingOtp(
        userId,
        purpose
    );

    // Generate new OTP
    const otp = generateOtp();

    // Hash OTP
    const otpHash = await bcrypt.hash(
        otp,
        10
    );

    // Expiry time (5 min)
    const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
    );

    // Store OTP
    await otpRepository.createOtp({
        userId,
        otpHash,
        purpose,
        expiresAt,
    });

    return otp;
};

const verifyOtpService = async ({
    userId,
    otp,
    purpose,
}) => {

    const existingOtp =
        await otpRepository.getOtpByUserId(
            userId,
            purpose
        );

    if (!existingOtp) {
        const error = new Error("OTP not found");
        error.status = 400;
        throw error;
    }

    // Expiry check
    if (
        new Date() > existingOtp.expires_at
    ) {

        await otpRepository.deleteOtpById(
            existingOtp.id
        );

        throw new Error("OTP expired");
    }

    // Compare hash
    const isOtpValid =
        await bcrypt.compare(
            otp,
            existingOtp.otp_hash
        );

    if (!isOtpValid) {
        const error = new Error("Invalid OTP");
        error.status = 400;
        throw error;
    }

    // Delete OTP after success
    await otpRepository.deleteOtpById(
        existingOtp.id
    );

    return true;
};

module.exports = {
    createOtpService,
    verifyOtpService,
};

