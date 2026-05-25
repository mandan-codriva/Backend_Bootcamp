const profileRepository = require("./profile.repository");

const getAllProfilesService = async (options = {}) => {
  let {
    page = 1,
    limit = 10,
    role = null,
    search = null,
    sortBy = "created_at",
    sortOrder = "DESC"
  } = options;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1 || limit > 100) limit = 10;

  // Whitelist sort fields
  const allowedSortFields = ["id", "username", "role", "created_at", "full_name", "followers_count", "likes_count"];
  let finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";

  // Resolve sorting field to table alias prefix where appropriate
  if (finalSortBy === "username" || finalSortBy === "role" || finalSortBy === "id") {
    finalSortBy = `users.${finalSortBy}`;
  } else if (finalSortBy === "full_name" || finalSortBy === "created_at") {
    finalSortBy = `profiles.${finalSortBy}`;
  }

  // Normalize sortOrder
  const finalSortOrder = ["ASC", "DESC"].includes(String(sortOrder).toUpperCase())
    ? String(sortOrder).toUpperCase()
    : "DESC";

  const profiles = await profileRepository.getAllProfiles({
    page,
    limit,
    role,
    search,
    sortBy: finalSortBy,
    sortOrder: finalSortOrder
  });

  const total = await profileRepository.totalProfiles({ role, search });
  const totalPages = Math.ceil(total / limit);

  return {
    profiles,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

const getProfileByUserIdService = async (userId) => {
  const profile = await profileRepository.getProfileByUserId(userId);

  if (!profile) {
    const error = new Error("Profile not found");
    error.status = 404;
    throw error;
  }

  return profile;
};

const updateAvatarService = async (userId, avatarUrl) => {
  if (!avatarUrl) {
    throw new Error("Avatar image is required");
  }

  const updatedProfile = await profileRepository.updateAvatar(
    userId,
    avatarUrl
  );

  return updatedProfile;
};



const updateProfileDetailsService = async (userId, { fullName, bio }) => {
  const updatedProfile = await profileRepository.updateProfileDetails(userId, {
    fullName,
    bio,
  });

  return updatedProfile;
};

module.exports = {
  getAllProfilesService,
  getProfileByUserIdService,
  updateAvatarService,
  updateProfileDetailsService,
};
