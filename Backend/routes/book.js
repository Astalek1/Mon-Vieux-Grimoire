const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const multer = require('../middleware/multer-config');
const resizeImage = require('../middleware/resizeImage');





router.get('/bestrating', bookCtrl.getTopBooks);
router.get('/:id', bookCtrl.getOneBook);
router.get('/', bookCtrl.getAllBooks);

router.post('/:id/rating', auth, bookCtrl.rateBook)
router.post('/', auth, multer, resizeImage, bookCtrl.createBook);

router.put('/:id', auth, multer,resizeImage, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);


module.exports = router; 