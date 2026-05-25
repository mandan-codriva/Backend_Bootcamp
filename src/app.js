const swaggerUi = require(
  "swagger-ui-express"
);

const swaggerSpec = require(
  "./config/swagger"
);



const express = require("express");

const helmet = require("helmet");

const cors = require("cors");

const morgan = require("morgan");

const path = require("path");

const cookieParser = require(
  "cookie-parser"
);

const pool = require("./config/db");


const errormiddleware = require(
  "./middleware/error.middleware"
);

const authMiddleware = require(
  "./middleware/auth.middleware"
);

const authRoutes = require(
  "./modules/auth/auth.routes"
);
const profileRoutes = require("./modules/profiles/profile.routes");

const postsRoutes = require(
  "./modules/posts/posts.routes"
);

const commentsRoutes = require(
  "./modules/comments/comments.routes"
);

const reactionsRoutes = require(
  "./modules/reactions/reactions.routes"
);

const subscribersRoutes = require(
  "./modules/subscribers/subscribers.routes"
);

const mediaRoutes = require("./modules/media/upload.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");


const app = express();





// BODY PARSER
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // Dynamically echo the requesting origin to satisfy cross-origin cookie sharing credentials
      callback(null, true);
    },
    credentials: true,
  })
);


// STATIC FILES
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

app.use("/api/v1/", mediaRoutes);





// SECURITY
// app.use(helmet());



// CORS

// app.use(cors({
//   origin: true,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));



// LOGGER
app.use(morgan("dev"));



// COOKIE PARSER
app.use(cookieParser());

app.use(
  "/api-docs",

  swaggerUi.serve,

  swaggerUi.setup(swaggerSpec)
);

app.get("/api-docs.json", (req, res) => {
  res.status(200).json(swaggerSpec);
});

// ROUTES
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/profiles", profileRoutes);

app.use(
  "/api/v1/posts",
  postsRoutes
);

app.use(
  "/api/v1/comments",
  commentsRoutes
);

app.use(
  "/api/v1/reactions",
  reactionsRoutes
);

app.use(
"/api/v1/subscribers",
subscribersRoutes
);

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/analytics", analyticsRoutes);



// ROOT ROUTE
app.get("/", (req, res) => {

  res.json({
    message: "API running",
  });

});



// HEALTH CHECK
app.get("/health", (req, res) => {

  res.status(200).json({
    success: true,
    message: "Server healthy",
  });

});



// DATABASE HEALTH
app.get(
  "/db-health",
  async (req, res) => {

    try {

      const result =
        await pool.query(
          "SELECT NOW()"
        );



      res.status(200).json({
        success: true,
        time: result.rows[0],
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        error: error.message,
      });

    }

  }
);



// PROFILE
app.get(
  "/profile",

  authMiddleware,

  async (req, res, next) => {
    try {
      const authRepository = require("./modules/auth/auth.repository");
      const user = await authRepository.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          full_name: user.full_name,
          bio: user.bio,
          avatarUrl: user.avatar_url,
          avatar_url: user.avatar_url,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);



// GLOBAL ERROR HANDLER
app.use(errormiddleware);

module.exports = app;
