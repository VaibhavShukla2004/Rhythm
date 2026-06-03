const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: {   //to join(by players),fetch room(to view details)
      type: String,
      required: true,
      unique: true,
    },

    hostId: {//RBAC checks-kickPlayer(),startGame(),deleteRoom(),transferHost()
      type: mongoose.Schema.Types.ObjectId,//in this case,such type is a foreg 24 digit id generated.But since ref is used,it fetches an id from User collection and assigns it to hostId field.
      ref: "User",
      required: true,
    },

    players: [
      {
        userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
        joinedAt: {
                type: Date,
                default: Date.now//to transfer host to oldest player when host leaves,show "joined 5 mins ago" etc
            }
    }
    ],

    maxPlayers: {//to restrict ofc
      type: Number,
      required: true,
      min: 2,
      max: 10,//hardCoded for now
    },

    status: {//basic stuff like preventing somebody to join when in game/ended,or allowing to join when waiting
      type: String,
      enum: ["waiting", "in-game", "ended"],//can check google doc on 3rd of june to understand why "ended" exists
      default: "waiting",
    },

    expiresAt: {//to remove room logic when post expiry
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);

//collections mean tables, documents mean rows, and fields mean columns in the context of MongoDB.