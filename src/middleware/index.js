const streams = require("./streams");
const apicache = require('apicache');

module.exports = function (app) {
  const limiter = require("express-limiter")(app, app.redisClient);
  const redisAPICache = apicache.options({
    redisClient: app.redisClient,
  }).middleware;
  app.get(
    "/v1/streams",
    limiter({
      lookup: "headers.cf-connecting-ip",
      total: 30,
      expire: 60 * 1000,
    }),
    redisAPICache("10 seconds"),
    streams(app)
  );
};
