const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const errormiddleware = require("./middleware/error.middleware"); 
const pool = require("./config/db");
const authRoutes = require("./modules/auth/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");
const cookieParser = require("cookie-parser");

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

app.use(express.json());

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use(
  "/api/v1/reactions",
  reactionsRoutes
);

app.get("/", (req, res) => {
  res.json({
    message: "API running"
  });
});

app.get("/health",(req,res)=>{
  res.status(200).json({
     success: true,
    message: "Server healthy",
  });
});

app.get("/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

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
});

app.get("/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

app.use(errormiddleware);

module.exports = app;



