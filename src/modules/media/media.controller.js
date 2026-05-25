const mediaService = require(
    "./media.service"
);

const uploadMedia =
    async (req, res, next) => {

        try {

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File required",
                });
            }

            const document =
                await mediaService.uploadMediaService(
                    req.file,
                    req.user.id
                );

            res.status(201).json({
                success: true,
                message:
                    "File uploaded successfully",
                data: document,
            });

        } catch (error) {
            next(error);
        }
    };


const getProfileMedia = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const media = await mediaService.getDocumentsByUserService(userId);

        res.status(200).json({
            success: true,
            message: "Profile media fetched successfully",
            data: media,
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    uploadMedia,
    getProfileMedia,
};
