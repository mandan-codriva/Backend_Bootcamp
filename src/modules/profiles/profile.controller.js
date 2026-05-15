const profileService = require("./profile.service");

const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await profileService.getAllProfilesService();

    return res.status(200).json({
      success: true,
      message: "Profiles fetched successfully",
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const profile = await profileService.getProfileByUserIdService(userId);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const updatedProfile =
      await profileService.updateAvatarService(
        userId,
        req.file
      );

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getAllProfiles,
  getProfileByUserId,
  updateAvatar,
};




