const axios = require('axios');

const BASE_URL = 'https://api.example.com/songs';

exports.getAllSongs = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

exports.getSongById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

exports.getSongByName = async (name) => {
  const response = await axios.get(`${BASE_URL}?name=${name}`);
  return response.data;
};