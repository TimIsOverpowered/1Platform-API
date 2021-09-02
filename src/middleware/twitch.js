const axios = require("axios");
const config = require("../../config/config.json");
const fs = require("fs");
const path = require("path");

module.exports.checkToken = async () => {
  let isValid = false;
  await axios(`https://id.twitch.tv/oauth2/validate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.twitch.access_token}`,
    },
  })
    .then((response) => {
      if (response.status < 400) isValid = true;
    })
    .catch(async (e) => {
      if (!e.response) return console.error(e);
      if (e.response.status === 401) {
        console.info("Twitch App Token Expired");
        return await this.refreshToken();
      }
    });
  return isValid;
};

module.exports.refreshToken = async () => {
  await axios
    .post(
      `https://id.twitch.tv/oauth2/token?client_id=${config.twitch.client_id}&client_secret=${config.twitch.client_secret}&grant_type=client_credentials`
    )
    .then((response) => {
      const data = response.data;
      config.twitch.access_token = data.access_token;
      fs.writeFile(
        path.resolve(__dirname, "../../config/config.json"),
        JSON.stringify(config, null, 4),
        (err) => {
          if (err) return console.error(err);
          console.info("Refreshed Twitch App Token");
        }
      );
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.error(e.response.data);
    });
};

module.exports.getStreams = async () => {
  await this.checkToken();
  let streams;
  await axios
    .get(`https://api.twitch.tv/helix/streams?first=100`, {
      headers: {
        Authorization: `Bearer ${config.twitch.access_token}`,
        "Client-Id": config.twitch.client_id,
      },
    })
    .then((response) => {
      streams = response.data.data;
    })
    .catch((e) => {
      if (!e.response) return console.error(e);
      console.error(e.response.data);
    });
  return streams;
};
