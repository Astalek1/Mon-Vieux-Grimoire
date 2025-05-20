const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(); // pas de fichier à traiter
  }

  const originalName = path.parse(req.file.originalname).name; // sans l'extension
  const safeName = originalName.replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase();
  const filename = `${safeName}-${Date.now()}.webp`;
  
  const filePath = path.join('images', filename);

  try {
    await sharp(req.file.buffer)
      .resize(206, 260, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toFile(filePath);

    req.file.filename = filename; // important pour le contrôleur
    next();
  } catch (err) {
    console.error('Erreur de redimensionnement Sharp :', err);
    res.status(500).json({ error: "Erreur lors du traitement de l’image." });
  }
};