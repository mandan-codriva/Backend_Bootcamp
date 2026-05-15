const mediaRepository = require(
  "./media.repository"
);

const savePostMediaService = async (
  postId,
  files
) => {

  // No files uploaded
  if (!files || files.length === 0) {
    return [];
  }

  const mediaRecords = [];



  for (const file of files) {

    let mediaType = "document";



    if (
      file.mimetype.startsWith("image")
    ) {

      mediaType = "image";

    } else if (
      file.mimetype.startsWith("video")
    ) {

      mediaType = "video";

    } else if (
      file.mimetype.startsWith("audio")
    ) {

      mediaType = "audio";

    }



    const mediaUrl = file.path;



    const media =
      await mediaRepository.createPostMedia({
        postId,
        mediaUrl,
        mediaType,
      });



    mediaRecords.push(media);

  }

  return mediaRecords;
};


const getPostMediaService = async (
  postId
) => {

  const media =
    await mediaRepository.getMediaByPostId(
      postId
    );

  return media;

};

module.exports = {
  savePostMediaService,
  getPostMediaService,
};



module.exports = {
  savePostMediaService,
  getPostMediaService,
};
