import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  comment: { type: String, required: true },
  status: { type: String, required: true },
  mode: { type: String, required: true },
});

const sessionModel =
  mongoose.models.session || mongoose.model("session", sessionSchema);

export default sessionModel;
