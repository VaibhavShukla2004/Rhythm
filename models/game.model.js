const mongoose = require('mongoose')
const { Schema } = mongoose

const GameSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
   
    gameState: { type: String, enum: ['in-progress', 'ended'],default: 'in-progress'},//starting before game starts,in-progress after round starts,ended when game ends and displays stat page

    currentTurnIndex: { type: Number, default: 0 },

    players: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        state: {
          type: String,
          enum: [
            'choosing-song',//only a chooser state
            'choosing-hint',//only a chooser state
            'stand-by',//when guessers are waiting for chooser or when chooser is waiting for guesser
            'guessing',//a guesser state
            'guessed',//a guesser state
            'timed-out'//when players couldnt guess after 2 mins passing
          ],
          default: 'stand-by'
        },
        guessStartedAt: { type: Date },
        guessedAt: { type: Date }
      }
    ],

    stats: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        totalGuessTimeMs: { type: Number, default: 0 },
       guessesCorrect: { type: Number, default: 0 },

    songsChosen: [//we havent implemented this yet
      {
        songTitle: String,
        artistName: String
      }
    ],

    songsGuessedCorrectly: [//havent implemented this yet
      {
        songTitle: String,
        artistName: String
      }
    ]
      }
    ],

pendingTurn: {//temporarily stores the songTitle,artistname and playerHint which will get persisted in turns if successful
    songTitle: String,
    artistName: String,
    playerHint: String,
    aiResponse: String,
      status: {
    type: String,
    startedAt: Date,//stores the time at which chooser timer starts,easier to calculate time remaining for turn and also can recover after server restart
    enum: [
      'generating',
      'success',
      'failing'//I'm thinking null when nothing,'generating' when generation started,'succes' if ready,'failed' if could not.
    ],
  },
    retryCount: {
        type: Number,
        default: 0
    }
},
finishedAt: {
    type: Date
},
finalResults: [
    {
        playerId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },

        score: {
            type: Number
        },

        rank: {
            type: Number
        },

        guessesCorrect: {
            type: Number
        },

        totalGuessTimeMs: {
            type: Number
        }
    }
],
    turns: [{
      chooserPlayerId: { type: Schema.Types.ObjectId, ref: 'User' },
      songTitle: { type: String },
      artistName: { type: String },
      lyrics: { type: String },
      playerHint: { type: String },
      aiHint: { type: String },
      status: {
        type: String,
        enum: ['ready','failed'],//generating is when response is being fetched,ready is when response fetched and failed is wehn response couldnt be fetched
      },
    }]
  },
  { timestamps: true }
)

module.exports = mongoose.model('Game', GameSchema)