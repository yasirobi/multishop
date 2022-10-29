const express = require('express');
const { adminCreate, getProducts, read,getBestsellers,adminGetProducts,
    removeProduct,adminUpdateProduct } = require('../controllers/productController')



const router = express.Router()


router.get('/products', getProducts)
router.get("/category/:categoryName/search/:searchQuery", getProducts)//search for specific category
router.get("/products/category/:categoryName", getProducts)
router.get("/products/search/:searchQuery", getProducts)//search for all categoris
router.get('/get-one/:id', read)
router.get("/products/bestsellers", getBestsellers)

// router.post("/attr", saveAttr)


//admin routes
router.post('/product/admin', adminCreate)
router.get("/products/admin", adminGetProducts)
router.delete('/product/admin/:id', removeProduct )
router.put("/product/admin/:id", adminUpdateProduct)

module.exports = router;