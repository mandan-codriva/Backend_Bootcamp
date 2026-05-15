const profileRepository = require("./profile.repository");

const getAllProfilesService = async () => {
  return await profileRepository.getAllProfiles();
};

const getProfileByUserIdService = async (userId) => {
  const profile = await profileRepository.getProfileByUserId(userId);

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
};

const updateAvatarService = async (userId, file) => {
  if (!file) {
    throw new Error("Avatar image is required");
  }

  const avatarUrl = `/uploads/images/profiles/${file.filename}`;

  const updatedProfile = await profileRepository.updateAvatar(
    userId,
    avatarUrl
  );

  return updatedProfile;
};



module.exports = {
  getAllProfilesService,
  getProfileByUserIdService,
  updateAvatarService,
};
