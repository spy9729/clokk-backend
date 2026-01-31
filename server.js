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
app.use(cors());
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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port : ${process.env.PORT}`);
});
