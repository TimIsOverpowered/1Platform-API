const { google } = require("googleapis");

module.exports.getStreams = async (app) => {
  const youtube_api = google.youtube({
    version: "v3",
    auth: app.get("youtube").api_key,
  });

  let streams = await getStreams(app.get("youtube").api_key, 50),
    streamIds = [],
    items = [];

  for (let item of streams) {
    streamIds.push(item.id.videoId);
  }

  for (let i = 0; i < streamIds.length; i += 50) {
    let tmpArray = streamIds.slice(i, i + 50);
    let response = await youtube_api.videos.list({
      part: "liveStreamingDetails,contentDetails,snippet",
      id: tmpArray,
    });
    items = items.concat(response.data.items);
  }

  return items;
};

function getStreams(key, howMany, streams = [], pageToken) {
  return new Promise((resolve, reject) => {
    const youtube_api = google.youtube({
      version: "v3",
      auth: key,
    });

    youtube_api.search.list(
      {
        part: "id",
        eventType: "live",
        type: "video",
        order: "viewCount",
        maxResults: 50,
        videoCategoryId: 20,
        pageToken: pageToken,
      },
      (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        streams = streams.concat(res.data.items);
        if (res.data.nextPageToken && streams.length < howMany) {
          getStreams(key, howMany, streams, res.data.nextPageToken).then(
            (resStreams) => {
              resolve(resStreams);
            }
          );
        } else {
          resolve(streams);
        }
      }
    );
  });
}
