const profileService = require("../services/profile.service");

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const profile = await profileService.getProfile(userId);

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
