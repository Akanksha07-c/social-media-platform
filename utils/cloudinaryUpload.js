const cloudinary = require("../config/cloudinaryConfig");

function uploadToCloudinary(buffer, folder) {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder
            },
            (error, result) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }

            }
        );

        stream.end(buffer);
    });
}

module.exports = uploadToCloudinary;