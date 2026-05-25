const pool = require("../../config/db");

/**
 * Gets count of blogs by status (published, draft, scheduled, archived) for a creator.
 */
const getBlogsCountStats = async (authorId) => {
  const query = `
    SELECT 
      COUNT(*) FILTER (WHERE status = 'published') AS published_count,
      COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
      COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled_count,
      COUNT(*) FILTER (WHERE status = 'archived') AS archived_count,
      COUNT(*) AS total_count
    FROM posts
    WHERE author_id = $1;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows[0];
};

/**
 * Gets total views, unique visitors, and views per blog for a creator.
 */
const getViewsAndReadersStats = async (authorId) => {
  const query = `
    SELECT 
      COALESCE(COUNT(pv.id), 0) AS total_views,
      COALESCE(COUNT(DISTINCT COALESCE(pv.viewer_id::text, pv.ip_address)), 0) AS unique_visitors,
      ROUND(COALESCE(COUNT(pv.id)::numeric / NULLIF(COUNT(DISTINCT p.id), 0), 0), 2) AS views_per_blog
    FROM posts p
    LEFT JOIN post_views pv ON p.id = pv.post_id
    WHERE p.author_id = $1;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows[0];
};

/**
 * Gets engagement stats (likes, comments, replies count) for a creator.
 */
const getEngagementStats = async (authorId) => {
  const query = `
    SELECT 
      COALESCE(COUNT(DISTINCT pr.id) FILTER (WHERE pr.reaction_type = 'like'), 0) AS total_likes,
      COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.parent_comment_id IS NULL), 0) AS total_comments,
      COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.parent_comment_id IS NOT NULL), 0) AS total_replies
    FROM posts p
    LEFT JOIN post_reactions pr ON p.id = pr.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.author_id = $1;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows[0];
};

/**
 * Gets subscribers metrics for a creator.
 */
const getSubscriberStats = async (authorId) => {
  const query = `
    SELECT 
      COALESCE(COUNT(*), 0) AS total_subscribers,
      COALESCE(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days'), 0) AS new_subscribers_this_week,
      COALESCE(COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) AS new_subscribers_this_month
    FROM subscribers
    WHERE creator_id = $1;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows[0];
};

/**
 * Gets creator's popular blog and other stats.
 */
const getCreatorProfileStats = async (authorId) => {
  const popularBlogQuery = `
    SELECT p.id, p.title, COUNT(pv.id) AS view_count
    FROM posts p
    LEFT JOIN post_views pv ON p.id = pv.post_id
    WHERE p.author_id = $1
    GROUP BY p.id
    ORDER BY view_count DESC
    LIMIT 1;
  `;
  
  const popularResult = await pool.query(popularBlogQuery, [authorId]);
  
  return {
    mostPopularBlog: popularResult.rows[0] || null
  };
};

/**
 * Gets analytics for an individual blog post.
 */
const getBlogPostLevelStats = async (postId) => {
  const query = `
    SELECT 
      p.id,
      p.title,
      p.created_at AS publish_date,
      p.status,
      COALESCE(COUNT(DISTINCT pv.id), 0) AS views,
      COALESCE(COUNT(DISTINCT pr.id) FILTER (WHERE pr.reaction_type = 'like'), 0) AS likes,
      COALESCE(COUNT(DISTINCT c.id), 0) AS comments
    FROM posts p
    LEFT JOIN post_views pv ON p.id = pv.post_id
    LEFT JOIN post_reactions pr ON p.id = pr.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.id = $1
    GROUP BY p.id;
  `;
  const result = await pool.query(query, [postId]);
  return result.rows[0];
};

/**
 * Gets recent activity feed stats for the creator.
 */
const getRecentActivitiesFeed = async (authorId, limit = 10) => {
  const query = `
    SELECT 
      al.id,
      al.activity_type,
      al.created_at,
      al.metadata,
      u.username AS trigger_user
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT $1;
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Gets high-level platform health metrics for the admin.
 */
const getPlatformStatsForAdmin = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE LOWER(role) = 'creator') AS total_creators,
      (SELECT COUNT(*) FROM posts WHERE status = 'published') AS total_published_blogs,
      (SELECT COUNT(*) FROM posts WHERE created_at >= CURRENT_DATE) AS blogs_published_today,
      (SELECT COUNT(*) FROM comments) AS total_comments,
      (SELECT COUNT(*) FROM post_views) AS total_views,
      (SELECT COUNT(*) FROM post_reactions WHERE reaction_type = 'like') AS total_likes
    ;
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Gets the total count of registered users in the platform.
 */
const getTotalUsersCount = async () => {
  const query = `SELECT COUNT(*) AS count FROM users;`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count || 0);
};

/**
 * Gets count of blogs posted per month for a creator.
 */
const getBlogsPostedPerMonthStats = async (authorId) => {
  const query = `
    SELECT 
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COUNT(*)::integer AS count
    FROM posts
    WHERE author_id = $1
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) DESC;
  `;
  const result = await pool.query(query, [authorId]);
  return result.rows;
};

module.exports = {
  getBlogsCountStats,
  getViewsAndReadersStats,
  getEngagementStats,
  getSubscriberStats,
  getCreatorProfileStats,
  getBlogPostLevelStats,
  getRecentActivitiesFeed,
  getPlatformStatsForAdmin,
  getTotalUsersCount,
  getBlogsPostedPerMonthStats,
};
