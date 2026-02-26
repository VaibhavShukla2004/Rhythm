const { Client } = require("lrclib-api");

const client = new Client();

exports.getUnsyncedLyrics = async () => {
  const query = {
    track_name: "The Chain",
    artist_name: "Fleetwood Mac",
  };

  const lyrics = await client.getUnsynced(query);

  return lyrics;
};