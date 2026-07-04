import api from './index';

export const submitSong = (gameId, songTitle, artistName) =>
  api.post(`/game/submit-Song/${gameId}`, { songTitle, artistName });

export const submitHint = (gameId, playerHint) =>
  api.post(`/game/submit-Hint/${gameId}`, { playerHint });

export const submitGuess = (gameId, guessedSong, guessedArtist) =>
  api.post(`/game/submit-Guess/${gameId}`, { guessedSong, guessedArtist });

export const retryChoice = (gameId) =>
  api.post(`/game/retry-Choice/${gameId}`);

export const skipTurn = (gameId) =>
  api.post(`/game/skip-Turn/${gameId}`);
