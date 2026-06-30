const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    gamesPlayed: {
      type: Number,
      default: 0,
    },

    songsChosen: [
      {
        songTitle: {
          type: String,
          required: true,
        },
        artistName: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Profile", profileSchema);
