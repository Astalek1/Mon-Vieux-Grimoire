const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const multer = require('../middleware/multer-config');



router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, multer, bookCtrl.createBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.updateBook);


module.exports = router; 