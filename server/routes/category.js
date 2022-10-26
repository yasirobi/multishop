const express = require('express');
const { create, list, removeCategory, saveAttr } = require('../controllers/categoryController')



const router = express.Router()

router.post('/create', create)
router.get('/list', list)
router.delete('/remove/:category',removeCategory )
router.post("/attr", saveAttr)


module.exports = router;