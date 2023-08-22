const axios = require('axios');

const $http = axios.create({
    baseURL: process.env.CLICKUP_API,
    headers: {'Authorization': process.env.CLICKUP_TOKEN}
});


module.exports = $http;