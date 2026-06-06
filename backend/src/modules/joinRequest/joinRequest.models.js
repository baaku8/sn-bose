import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    message: {
      type: String,
      maxlength: 300,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate join requests
joinRequestSchema.index(
  {
    sender: 1,
    team: 1,
  },
  {
    unique: true,
  }
);

const JoinRequest=mongoose.model(
  "JoinRequest",
  joinRequestSchema
);
export default joinRequest