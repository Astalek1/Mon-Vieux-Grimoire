const { body, validationResult } = require('express-validator');

// Validation pour l'authentification
const authValidation = {
  signup: [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .withMessage('Le mot de passe doit contenir au moins une lettre, un chiffre et un caractère spécial')
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Le mot de passe est requis')
  ]
};

// Validation pour les livres
const bookValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ min: 3, max: 100 })
      .withMessage('Le titre doit contenir entre 3 et 100 caractères'),
    body('author')
      .notEmpty()
      .withMessage('L\'auteur est requis')
      .isLength({ min: 2, max: 100 })
      .withMessage('Le nom de l\'auteur doit contenir entre 2 et 100 caractères'),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage('L\'année doit être valide'),
    body('genre')
      .notEmpty()
      .withMessage('Le genre est requis')
  ],
  rate: [
    body('rating')
      .isFloat({ min: 0, max: 5 })
      .withMessage('La note doit être comprise entre 0 et 5')
  ]
};

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  authValidation,
  bookValidation,
  validate
}; 