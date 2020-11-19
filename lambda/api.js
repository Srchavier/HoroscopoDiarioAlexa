const axios = require('axios');

const api = axios.create({
  baseURL: 'https://alexa-projeto-api.herokuapp.com/horoscopo',
  timeout: 9000
});
module.exports = api