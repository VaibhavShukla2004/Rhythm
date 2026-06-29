const Profile = require("../models/profile.model");

async function updateProfiles(game) {
    for (const stat of game.stats) {
        await Profile.findOneAndUpdate(
            { userId: stat.playerId },
            { $inc: { gamesPlayed: 1 } }
        );
    }
    await Profile.save();

for (const turn of game.turns) {

    await Profile.findOneAndUpdate(
        { userId: turn.chooserPlayerId },
        {$push: {songsChosen: {songTitle: turn.songTitle,artistName: turn.artistName}}}
    );
}
await Profile.save();
}

async function getProfile(userId) {

    const profile =
        await Profile.findOne({
            userId
        });

    if (!profile) {
        throw new Error(
            "Profile not found."
        );
    }

    return profile;
}

module.exports = {
    updateProfiles,getProfile
};
