import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";

// app
const app = express();
connectDB();
connectCloudinary();

// CORS — whitelist frontend HTTPS URL
app.use(
  cors({
    origin: ["http://localhost:5173", "https://clokk-frontend.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "token", // ADD THIS
      "Accept",
    ],
  }),
);

app.use(express.json());
app.use("/api/user", userRouter);

app.use(express.json());
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("BACKEND RUNNING, APIs working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
