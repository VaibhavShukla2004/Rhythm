const { Client } = require("lrclib-api");

const client = new Client();

exports.getUnsyncedLyrics = async (track_name,artist_name) => {
  const query = { track_name, artist_name};

  const lyrics = await client.getUnsynced(query);

  return lyrics;
};