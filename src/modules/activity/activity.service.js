
const activityRepository = require(
  "./activity.repository"
);

const createActivity = async ({
  userId,
  activityType,
  entityId,
  entityType,
  metadata = {},
}) => {
  return await activityRepository.createActivity({
    userId,
    activityType,
    entityId,
    entityType,
    metadata,
  });
};

const getRecentActivitiesService = async (
  userId
) => {
  return await activityRepository.getRecentActivitiesByUser(
    userId
  );
};

module.exports = {
  createActivity,
  getRecentActivitiesService,
};

