const youtube = require("./youtube");
const twitch = require("./twitch");

module.exports = function (app) {
  return async function (req, res, next) {
    let streams = [];
    const youtube_streams = await youtube.getStreams(app);
    for (let stream of youtube_streams) {
      streams.push({
        platform: "youtube",
        videoId: stream.id,
        username: stream.channelTitle,
        display_name: stream.channelTitle,
        created_at: stream.liveStreamingDetails.actualStartTime,
        thumbnail: stream.snippet.thumbnails.medium.url,
        view_count: stream.liveStreamingDetails.concurrentViewers,
        title: stream.snippet.title,
      });
    }

    const twitch_streams = await twitch.getStreams();
    for (let stream of twitch_streams) {
      stream.thumbnail_url.replace("{width}", "320");
      stream.thumbnail_url.replace("{height}", "180");
      streams.push({
        platform: "twitch",
        username: stream.user_login,
        display_name: stream.user_name,
        created_at: stream.started_at,
        thumbnail: stream.thumbnail_url,
        view_count: stream.viewer_count,
        title: stream.title,
      });
    }

    streams.sort(function (a, b) {
      return parseInt(b.view_count) - parseInt(a.view_count);
    });

    res.json(streams);
  };
};
