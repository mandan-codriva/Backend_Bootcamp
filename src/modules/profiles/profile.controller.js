const profileService = require("./profile.service");

const getAllProfiles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role = null,
      search = null,
      keyword = null,
      sortBy = "created_at",
      sort_by = null,
      sortOrder = "DESC",
      sort_order = null,
      order = null
    } = req.query;

    const finalSearch = search || keyword || null;
    const finalSortBy = sort_by || sortBy;
    const finalSortOrder = order || sort_order || sortOrder;

    const result = await profileService.getAllProfilesService({
      page,
      limit,
      role,
      search: finalSearch,
      sortBy: finalSortBy,
      sortOrder: finalSortOrder
    });

    return res.status(200).json({
      success: true,
      message: role 
        ? `${role.charAt(0).toUpperCase() + role.slice(1)} profiles fetched successfully` 
        : "Profiles fetched successfully",
      data: result,
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

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await profileService.getProfileByUserIdService(userId);

    return res.status(200).json({
      success: true,
      message: "Your profile retrieved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let avatarUrl = req.body?.avatarUrl;

    if (req.file) {
      avatarUrl = "/" + req.file.path.replace(/\\/g, "/");
    }

    const updatedProfile =
      await profileService.updateAvatarService(
        userId,
        avatarUrl
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


const updateProfileDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, bio } = req.body;

    const updatedProfile = await profileService.updateProfileDetailsService(
      userId,
      { fullName, bio }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProfiles,
  getProfileByUserId,
  getMyProfile,
  updateAvatar,
  updateProfileDetails,
};




