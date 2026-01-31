import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import authUser from "./middlewares/authUser.js";
import connectCloudinary from "./config/cloudinary.js";

// app config
const app = express();
connectDB();
connectCloudinary();

// allowed origins: local dev + live frontend
const allowedOrigins = [
  "http://localhost:5173", // local dev
  "http://my-vite-clokk-frontend.s3-website.ap-south-1.amazonaws.com", // replace this with your S3/CloudFront URL
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// handle OPTIONS preflight globally
app.options("*", cors());

// parse JSON
app.use(express.json());

// api endpoints
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("BACKEND RUNNING, APIs working");
});

app.get("/api/test-auth", authUser, (req, res) => {
  res.json({
    success: true,
    message: "Auth working",
    userId: req.userId,
  });
});

// listen
app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
