const aiService = require('../services/ai.service');

// POST /ai/generate-hint
// Body: { lyrics: string, hint: string }
exports.generateHint = async (req, res, next) => {
  try {
    const { lyrics, hint } = req.body;

    if (!lyrics || !hint) {
      return res.status(400).json({ message: 'lyrics and hint required' });
    }

    const payload = aiService.generatePayload(lyrics, hint);
    const aiText = await aiService.getAIResponse(payload);

    return res.status(200).json({ aiHint: aiText });
  } catch (err) {
    next(err);
  }
};

// POST /ai/modify-lyrics
// Body: { lyrics: string, hint: string }
exports.modifyLyrics = async (req, res, next) => {
  try {
    const { lyrics, hint } = req.body;

    if (!lyrics || !hint) {
      return res.status(400).json({ message: 'lyrics and hint required' });
    }

    const payload = aiService.generateModifyLyricsPayload(lyrics, hint);
    const modifiedText = await aiService.getAIResponse(payload);

    return res.status(200).json({ modifiedLyrics: modifiedText.trim() });
  } catch (err) {
    next(err);
  }
};
