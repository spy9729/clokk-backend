import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import sessionModel from "../models/Session.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter strong password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await userModel.findOne({ email });

    if (userExists) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const getUserProfileData = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");

    return res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const updateProfileData = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, goal, gender, dob, groupCode } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !goal || !gender || !dob || !groupCode) {
      return res.json({ success: false, message: "Data missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      goal,
      gender,
      dob,
      groupCode,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {
        image: imageURL,
      });
    }

    return res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// api to create a session

const startSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { commentAuto } = req.body;
    const status = "Active";
    const startTime = new Date();

    if (!userId) {
      return res.json({ success: false, message: "Unauthorised access" });
    }

    const activeSession = await sessionModel.findOne({
      userId,
      status: "Active",
      mode: "Auto",
    });

    if (activeSession) {
      return res.json({
        success: false,
        message: "You have an active session already",
      });
    }

    const session = await sessionModel.create({
      userId,
      comment: commentAuto,
      status,
      startTime,
      mode: "Auto",
    });

    return res.json({ success: true, message: "Session started", session });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// api to end session

const endSession = async (req, res) => {
  try {
    const session = await sessionModel.findOne({
      _id: req.body.sessionId,
      userId: req.userId,
      status: "Active",
    });

    if (!session) {
      return res.json({ success: false, message: "No active session" });
    }

    const endTime = new Date();
    const durationMs = endTime - session.startTime;
    const totalMins = Math.floor(durationMs / (1000 * 60));

    session.endTime = endTime;
    session.status = "Completed";
    session.duration = totalMins;

    await session.save();

    return res.json({ success: true, message: "Session completed", session });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const getActiveSession = async (req, res) => {
  try {
    const session = await sessionModel.findOne({
      userId: req.userId,
      status: "Active",
      mode: "Auto",
    });

    if (!session) {
      return res.json({ success: true, session: null });
    }

    return res.json({ success: true, session });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error fetching session" });
  }
};

const cancelSession = async (req, res) => {
  try {
    const session = await sessionModel.findOneAndDelete({
      _id: req.body.sessionId,
      userId: req.userId,
      status: "Active",
    });

    return res.json({ success: true, message: "Session cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

const submitSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { submitHours, submitMinutes, commentManual } = req.body;

    const startTime = new Date();

    const hours = Number(submitHours);
    const minutes = Number(submitMinutes);

    const duration = minutes + hours * 60;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorised access" });
    }

    if (!commentManual.trim()) {
      return res.json({
        success: false,
        message: "Please add what you studied",
      });
    }

    if (submitHours == null || submitMinutes == null) {
      return res.json({ success: false, message: "Please add study time" });
    }

    if (isNaN(hours) || isNaN(minutes)) {
      return res.json({ success: false, message: "Invalid time input" });
    }

    if (duration === 0) {
      return res.json({ success: false, message: "Time can not be zero" });
    }

    if (duration > 12 * 60) {
      return res.json({
        success: false,
        message: "Time can not be more than 12 hours",
      });
    }

    const session = await sessionModel.create({
      userId,
      comment: commentManual,
      status: "Completed",
      startTime,
      duration,
      mode: "Manual",
    });

    return res.json({ success: true, message: "Session submitted", session });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error fetching session" });
  }
};

const getUserSessions = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.userId) {
      return res.json({ success: false, message: "Unauthorised access" });
    }

    const userSessions = await sessionModel.find({ userId });

    return res.json({ success: true, userSessions });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error fetching session" });
  }
};

const getGroupSessions = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);

    if (!user?.groupCode) {
      return res.json({ success: false, message: "No group joined" });
    }

    const groupUsers = await userModel.find(
      { groupCode: user.groupCode },
      "_id name image",
    );

    const groupUserIds = groupUsers.map((u) => u._id);

    const groupSessions = await sessionModel.find({
      userId: { $in: groupUserIds },
      status: "Completed",
    });

    return res.json({ success: true, groupSessions, groupUsers });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error fetching leaderboard" });
  }
};

const updateDailyGoal = async (req, res) => {
  try {
    const { dailyGoalMinutes } = req.body;

    if (!dailyGoalMinutes || dailyGoalMinutes < 30) {
      return res.json({
        success: false,
        message: "Daily goal must be at least 30 minutes",
      });
    }

    await userModel.findByIdAndUpdate(req.userId, {
      dailyGoalMinutes,
    });

    res.json({
      success: true,
      message: "Daily goal updated successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfileData,
  updateProfileData,
  startSession,
  endSession,
  cancelSession,
  getActiveSession,
  submitSession,
  getUserSessions,
  updateDailyGoal,
  getGroupSessions,
};
