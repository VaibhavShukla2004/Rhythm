
const mongoose = require('mongoose')
const { Schema } = mongoose

const GameSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },

    gameState: { type: String, enum: ['starting', 'in-progress', 'ended'], default: 'starting' },

    roundNumber: { type: Number, default: 0 },
    currentTurnIndex: { type: Number, default: 0 },

    players: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        state: {
          type: String,
          enum: [
            'choosing-song',
            'choosing-hint',
            'generating',
            'done',
            'stand-by',
            'guessing',
            'guessed'
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
        totalGuessTimeMs: { type: Number, default: 0 }
      }
    ],

    currentRound: {
      chooserPlayerId: { type: Schema.Types.ObjectId, ref: 'User' },
      songTitle: { type: String },
      lyrics: { type: String },
      playerHint: { type: String },
      aiHint: { type: String },
      status: {
        type: String,
        enum: ['waiting-song', 'waiting-hint', 'generating', 'ready'],
        default: 'waiting-song'
      }
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Game', GameSchema)
