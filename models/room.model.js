const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomCode: {   //to join(by players),fetch room(to view details)
      type: String,
      required: true,
      unique: true,
    },

    hostId: {//RBAC checks-kickPlayer(),startGame(),deleteRoom(),transferHost()
      type: mongoose.Schema.Types.ObjectId,//check 03/06/2026 doc. It points to an id in the User collection,id that we provide during room creation
      ref: "User",
      required: true,
    },
    gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    default: null
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
    }//an _id added to every sub document
    ],

    maxPlayers: {//to restrict ofc
      type: Number,
      required: true,
      min: 2,
      max: 10,//hardCoded for now
    },

    gamesPlayed: {
    type: Number,//so as to display useful match history
    default: 0
    },

    gameStatus: {
        type: String,
        enum: ["idle", "in-progress"],//i think dont let people do certain stuff when game is in progress. Dont mistake it such that once it goes from idle to in-progress,it will again come back to idle. After this it will straight up get deleted
        default: "idle"
  },
    expiresAt: {//to remove room logic when post expiry
      type: Date,
      required: true,
    },
    lastActivityAt: {
    type: Date,
    default: Date.now
}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);

//collections mean tables, documents mean rows, and fields mean columns in the context of MongoDB.