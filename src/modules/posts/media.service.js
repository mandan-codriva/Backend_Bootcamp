const mediaRepository = require(
  "./media.repository"
);

const savePostMediaService = async (
  postId,
  mediaItems
) => {

  // No media items provided
  if (!mediaItems || mediaItems.length === 0) {
    return [];
  }

  const mediaRecords = [];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const item of mediaItems) {
    let resolvedUrl = item;
    let mimeType = null;

    if (uuidRegex.test(item)) {
      const document = await mediaRepository.getDocumentById(item);
      if (document) {
        resolvedUrl = document.file_url;
        mimeType = document.mime_type;
      }
    }

    let mediaType = "document";
    if (mimeType) {
      if (mimeType.startsWith("image/")) {
        mediaType = "image";
      } else if (mimeType.startsWith("video/")) {
        mediaType = "video";
      } else if (mimeType.startsWith("audio/")) {
        mediaType = "audio";
      }
    } else {
      const lowercaseUrl = resolvedUrl.toLowerCase();
      if (
        lowercaseUrl.endsWith(".jpg") ||
        lowercaseUrl.endsWith(".jpeg") ||
        lowercaseUrl.endsWith(".png") ||
        lowercaseUrl.endsWith(".webp") ||
        lowercaseUrl.endsWith(".gif")
      ) {
        mediaType = "image";
      } else if (
        lowercaseUrl.endsWith(".mp4") ||
        lowercaseUrl.endsWith(".webm") ||
        lowercaseUrl.endsWith(".avi") ||
        lowercaseUrl.endsWith(".mov")
      ) {
        mediaType = "video";
      } else if (
        lowercaseUrl.endsWith(".mp3") ||
        lowercaseUrl.endsWith(".wav")
      ) {
        mediaType = "audio";
      }
    }

    const media =
      await mediaRepository.createPostMedia({
        postId,
        mediaUrl: resolvedUrl,
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
