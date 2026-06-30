const aiService = require("../services/ai.service");

exports.modifyLyrics = async (req, res, next) => {
  try {
    const { lyrics, hint } = req.body;

    if (!lyrics || !hint) {
      return res.status(400).json({ message: "lyrics and hint required" });
    }

    // The controller delegates the entire process to a single service method
    const aiText = await aiService.getModifiedLyrics(lyrics, hint);

    return res.status(200).json({ aiHint: aiText });
  } catch (err) {
    next(err); // Let the global error handler catch it
  }
};
