const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res,) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createBook = (req, res,) => {

  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier image reçu.' });
  }

  let bookObject;
  try {
    bookObject = JSON.parse(req.body.book);
  } catch (error) {
    return res.status(400).json({ error: 'Format JSON invalide pour book.' });
  }

  delete bookObject._id;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré avec image !' }))
    .catch(error => {
      console.error('Erreur lors de l\'enregistrement du livre :', error.message);
      res.status(500).json({ error: error.message });
    });
};
    

exports.deleteBook = (req, res,) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé à supprimer ce livre !' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      const filePath = `images/${filename}`;

      console.log('Tentative de suppression de l’image :', filePath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Erreur suppression image :', err);
          return res.status(500).json({ error: 'Erreur lors de la suppression de l’image.' });
        }

        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre et image supprimés !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => {
      console.error('Erreur serveur :', error);
      res.status(500).json({ error: 'Erreur lors de la recherche du livre.' });
    });
};

exports.getOneBook = (req, res,) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.updateBook = (req, res,) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé à modifier ce livre !' });
      }

      const bookObject = req.file
        ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          }
        : { ...req.body };

      delete bookObject._userId;

      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};



exports.rateBook = (req, res,) => {
  const userId = req.auth.userId;
  const rating = req.body.rating;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé.' });
      }

      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      book.ratings.push({ userId, grade: rating });

      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = total / book.ratings.length;
      

      book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getTopBooks = (req, res,) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};