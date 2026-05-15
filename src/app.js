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

const app = express();





// BODY PARSER
app.use(express.json());

app.use(cors());


// STATIC FILES
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);




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
app.use(
  "/api/v1/auth",
  authRoutes
);
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

  (req, res) => {

    res.status(200).json({
      success: true,
      user: req.user,
    });

  }
);



// GLOBAL ERROR HANDLER
app.use(errormiddleware);

module.exports = app;
