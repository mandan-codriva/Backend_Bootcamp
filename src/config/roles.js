const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
};
