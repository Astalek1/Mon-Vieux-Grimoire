const cloudinary = require('cloudinary').v2;

// Configuration avec les variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload une image depuis un buffer vers Cloudinary
 * @param {Buffer} buffer - L'image sous forme de buffer (traitée par Sharp)
 * @param {String} filename - Le nom du fichier (servira à nommer l'image sur Cloudinary)
 * @returns {Promise<{ url: string, public_id: string }>}
 */
function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mon-vieux-grimoire',
        public_id: filename.replace(/\.[^/.]+$/, ''), // retire l'extension s’il y en a
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id
          });
        }
      }
    );

    stream.end(buffer);
  });
}

module.exports = uploadToCloudinary;