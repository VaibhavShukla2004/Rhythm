const { Client } = require("lrclib-api"); //In Node.js, require("lrclib-api") is the exact equivalent of a Java import statement.You are importing an external library that someone else wrote.
//The library provides a class blueprint named Client. Just like in Java, you can't use a blueprint directly to do work; you have to instantiate it.
const client = new Client();

exports.getUnsyncedLyrics = async (track_name, artist_name) => {
  const query = { track_name, artist_name }; //from documentation i come to know that this is needed.

  const lyrics = await client.getUnsynced(query);
  console.log(lyrics);
  const lyricsString = lyrics.map((line) => line.text).join("\n");

  return lyricsString;
};
