const sharp = require('sharp');
const path = require('path');

module.exports = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(); // pas de fichier à traiter
  }

  const originalName = path.parse(req.file.originalname).name; // sans l'extension
  const safeName = originalName.replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase(); //netoyage du nom
  const filename = `${safeName}-${Date.now()}.webp`; //génére un nom avec .webp


  try {
    req.file.buffer = await sharp(req.file.buffer)
      .resize(206, 260, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .toBuffer();

    req.file.filename = filename; // important pour le contrôleur
    next();
  } catch (error) {
    console.error('Erreur de redimensionnement Sharp :', error);
    res.status(500).json({ error: "Erreur lors du traitement de l’image." });
  }
};