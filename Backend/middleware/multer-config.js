const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// mémoire uniquement (pas d’écriture directe sur disque)
const storage = multer.memoryStorage();

module.exports = multer({ storage }).single('image');