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

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://my-vite-clokk-frontend.s3-website.ap-south-1.amazonaws.com", // HTTPS version
      // if using CloudFront/HTTPS add here
    ],
    credentials: true, // required if using cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
