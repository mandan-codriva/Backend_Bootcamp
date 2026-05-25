const mediaRepository = require(
    "./media.repository"
);

const uploadMediaService =
    async (file, userId) => {

        const fileUrl =
            "/" +
            file.path.replace(/\\/g, "/");

        const document =
            await mediaRepository.createDocument({
                original_name:
                    file.originalname,

                file_name:
                    file.filename,

                mime_type:
                    file.mimetype,

                file_size:
                    file.size,

                file_url: fileUrl,

                folder:
                    file.destination,

                uploaded_by: userId,
            });

        return document;
    };

const getDocumentsByUserService = async (userId) => {
    return await mediaRepository.getDocumentsByUser(userId);
};

module.exports = {
    uploadMediaService,
    getDocumentsByUserService,
};