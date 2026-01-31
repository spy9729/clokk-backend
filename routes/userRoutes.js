import express from "express";
import {
  cancelSession,
  endSession,
  getActiveSession,
  getGroupSessions,
  getUserProfileData,
  getUserSessions,
  loginUser,
  registerUser,
  startSession,
  submitSession,
  updateDailyGoal,
  updateProfileData,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getUserProfileData);
userRouter.post(
  "/update-profile",
  authUser,
  upload.single("image"),
  updateProfileData,
);
userRouter.put("/daily-goal", authUser, updateDailyGoal);

userRouter.post("/start-session", authUser, startSession);
userRouter.post("/end-session", authUser, endSession);
userRouter.post("/cancel-session", authUser, cancelSession);
userRouter.get("/active-session", authUser, getActiveSession);
userRouter.post("/submit-session", authUser, submitSession);

userRouter.get("/user-sessions", authUser, getUserSessions);
userRouter.get("/group-sessions", authUser, getGroupSessions);

export default userRouter;
