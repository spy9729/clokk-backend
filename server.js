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

// middlewares
// Allow your S3 frontend to access the backend
app.use(
  cors({
    origin: ["http://clokk-app.s3-website.eu-north-1.amazonaws.com"], // replace with your S3 URL
    credentials: true,
  }),
);
// or for testing, allow all (not recommended in production):
app.use(cors({ origin: "*", credentials: true }));
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

app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
