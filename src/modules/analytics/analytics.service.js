const analyticsRepository = require("./analytics.repository");

/**
 * Calculates Creator Score based on views, likes, comments, and subscribers.
 */
const calculateCreatorScore = (views, likes, comments, subscribers) => {
  const score = (0.4 * views) + (0.3 * likes) + (0.2 * comments) + (0.1 * subscribers);
  return parseFloat(score.toFixed(2));
};

/**
 * Calculates Engagement Rate based on total users, likes, comments, and replies.
 * Formula: ((likes + comments + replies) / totalUsers) * 100, capped at 100%.
 */
const calculateEngagementRate = (totalUsers, likes, comments, replies) => {
  if (!totalUsers || totalUsers === 0) return 0;
  const totalEngagement = likes + comments + replies;
  const rate = (totalEngagement / totalUsers) * 100;
  return parseFloat(Math.min(rate, 100.0).toFixed(2));
};

/**
 * Generates the complete dashboard stats summary for a creator.
 */
const getCreatorDashboardSummary = async (creatorId) => {
  const blogStats = await analyticsRepository.getBlogsCountStats(creatorId);
  const viewStats = await analyticsRepository.getViewsAndReadersStats(creatorId);
  const engagementStats = await analyticsRepository.getEngagementStats(creatorId);
  const subscriberStats = await analyticsRepository.getSubscriberStats(creatorId);
  const profileStats = await analyticsRepository.getCreatorProfileStats(creatorId);
  const recentActivities = await analyticsRepository.getRecentActivitiesFeed(creatorId, 10);
  const blogsPerMonth = await analyticsRepository.getBlogsPostedPerMonthStats(creatorId);

  const totalViews = parseInt(viewStats.total_views || 0);
  const totalLikes = parseInt(engagementStats.total_likes || 0);
  const totalComments = parseInt(engagementStats.total_comments || 0);
  const totalReplies = parseInt(engagementStats.total_replies || 0);
  const totalSubscribers = parseInt(subscriberStats.total_subscribers || 0);

  const totalUsers = await analyticsRepository.getTotalUsersCount();

  // Compute calculated metrics
  const engagementRate = calculateEngagementRate(
    totalUsers,
    totalLikes,
    totalComments,
    totalReplies
  );

  const creatorScore = calculateCreatorScore(
    totalViews,
    totalLikes,
    totalComments,
    totalSubscribers
  );

  return {
    overview: {
      totalBlogs: parseInt(blogStats.total_count || 0),
      publishedBlogs: parseInt(blogStats.published_count || 0),
      draftBlogs: parseInt(blogStats.draft_count || 0),
      scheduledBlogs: parseInt(blogStats.scheduled_count || 0),
      archivedBlogs: parseInt(blogStats.archived_count || 0),
      totalViews,
      uniqueVisitors: parseInt(viewStats.unique_visitors || 0),
      viewsPerBlog: parseFloat(viewStats.views_per_blog || 0),
      blogsPerMonth,
    },
    engagement: {
      totalLikes,
      totalComments,
      totalReplies,
      engagementRate,
      creatorScore,
    },
    subscribers: {
      totalSubscribers,
      newSubscribersThisWeek: parseInt(subscriberStats.new_subscribers_this_week || 0),
      newSubscribersThisMonth: parseInt(subscriberStats.new_subscribers_this_month || 0),
    },
    profilePerformance: {
      mostPopularBlog: profileStats.mostPopularBlog,
    },
    recentActivities,
  };
};

/**
 * Generates single blog performance analytics.
 */
const getBlogPostSummary = async (postId) => {
  const stats = await analyticsRepository.getBlogPostLevelStats(postId);
  
  if (!stats) {
    throw new Error("Post not found");
  }

  const views = parseInt(stats.views || 0);
  const likes = parseInt(stats.likes || 0);
  const comments = parseInt(stats.comments || 0);

  const totalUsers = await analyticsRepository.getTotalUsersCount();
  const engagementRate = calculateEngagementRate(totalUsers, likes, comments, 0);

  return {
    ...stats,
    views,
    likes,
    comments,
    engagementRate,
  };
};

/**
 * Generates platform health statistics for admins.
 */
const getAdminSummary = async () => {
  const adminStats = await analyticsRepository.getPlatformStatsForAdmin();
  return {
    totalUsers: parseInt(adminStats.total_users || 0),
    totalCreators: parseInt(adminStats.total_creators || 0),
    totalPublishedBlogs: parseInt(adminStats.total_published_blogs || 0),
    blogsPublishedToday: parseInt(adminStats.blogs_published_today || 0),
    totalComments: parseInt(adminStats.total_comments || 0),
    totalViews: parseInt(adminStats.total_views || 0),
    totalLikes: parseInt(adminStats.total_likes || 0),
  };
};

module.exports = {
  getCreatorDashboardSummary,
  getBlogPostSummary,
  getAdminSummary,
};
