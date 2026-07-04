/**
 * getMyPlayerState — given the full game document and the current user's ID,
 * extracts this player's state from the players array.
 *
 * Possible states (from game.model.js):
 *   'choosing-song' | 'choosing-hint' | 'stand-by' | 'guessing' | 'guessed' | 'timed-out'
 *
 * @param {object} game - Full game document from socket
 * @param {string} userId - Current user's ID from auth store
 * @returns {string|null} The player's current state, or null if not found
 */
export function getMyPlayerState(game, userId) {
  if (!game || !userId) return null;
  const player = game.players.find(
    (p) => p.playerId === userId || p.playerId?._id === userId
  );
  return player?.state ?? null;
}

/**
 * getChooser — returns the player object for the current turn's chooser
 *
 * @param {object} game - Full game document
 * @returns {object|null} The chooser player object
 */
export function getChooser(game) {
  if (!game) return null;
  return game.players[game.currentTurnIndex] ?? null;
}

/**
 * isMyTurn — returns true if the current user is the chooser this turn
 *
 * @param {object} game - Full game document
 * @param {string} userId - Current user's ID
 * @returns {boolean}
 */
export function isMyTurn(game, userId) {
  const chooser = getChooser(game);
  if (!chooser || !userId) return false;
  return chooser.playerId === userId || chooser.playerId?._id === userId;
}
