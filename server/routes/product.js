const express = require('express');
const { create, list, read, removeCategory, saveAttr } = require('../controllers/productController')



const router = express.Router()

router.post('/product', create)
router.get('/products', list)
router.get('/get-one/:id', read)
// router.delete('/remove/:category',removeCategory )
// router.post("/attr", saveAttr)


module.exports = router;