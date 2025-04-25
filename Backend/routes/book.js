const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const bookCtrl = require('../controllers/book');



router.get('/', bookCtrl.getAllBooks);
router.post('/', auth, bookCtrl.createBook);

module.exports = router;