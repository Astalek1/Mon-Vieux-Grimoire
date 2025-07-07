const Book = require('../models/Book');
const cloudinary = require('../middleware/cloudinary-config');

// GET : récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// GET : récupérer un livre par ID
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// POST : créer un nouveau livre avec image uploadée sur Cloudinary
exports.createBook = async (req, res) => {
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

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'mon-vieux-grimoire' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré avec image Cloudinary !' });
  } catch (err) {
    console.error('Erreur Cloudinary ou MongoDB :', err);
    res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
};

// PUT : modifier un livre (et éventuellement remplacer l’image sur Cloudinary)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé !' });
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce livre !' });
    }

    let updatedBook;
    if (req.file) {
      if (book.cloudinaryId) {
        await cloudinary.uploader.destroy(book.cloudinaryId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'mon-vieux-grimoire' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      updatedBook = {
        ...JSON.parse(req.body.book),
        imageUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id
      };
    } else {
      updatedBook = { ...req.body };
    }

    delete updatedBook._userId;

    await Book.updateOne({ _id: req.params.id }, { ...updatedBook, _id: req.params.id });
    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// DELETE : supprimer un livre et son image sur Cloudinary
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Livre non trouvé !' });
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce livre !' });
    }

    if (book.cloudinaryId) {
      await cloudinary.uploader.destroy(book.cloudinaryId);
    }

    await Book.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Livre et image supprimés !' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du livre.' });
  }
};

// POST : noter un livre
exports.rateBook = (req, res) => {
  const userId = req.auth.userId;
  const rating = req.body.rating;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé.' });

      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      book.ratings.push({ userId, grade: rating });

      const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = total / book.ratings.length;

      return book.save().then(() => res.status(200).json(book));
    })
    .catch(error => res.status(500).json({ error }));
};

// GET : livres avec meilleures notes
exports.getTopBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};