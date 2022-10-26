const Product = require("../models/Product");

exports.create = async (req, res) => {
    try {
        const product = new Product();
        const { name, description, count, price, category, attributesTable } =
          req.body;
        product.name = name;
        product.description = description;
        product.count = count;
        product.price = price;
        product.category = category;
        if (attributesTable.length > 0) {
          attributesTable.map((item) => {
            product.attrs.push(item);
          });
        }
        await product.save();
    
        res.json({
          message: "product created",
          productId: product._id,
        });
      } catch (err) {
        res.status(500).json({
            err:'internal server error'
        })
      }
};


exports.list = async (req,res) => {
    try {
        const products = await Product.find().sort({category: 1}).select("name price category")
        res.status(200).json({
            products
        })
    } catch (err) {
        res.status(500).json({
            err:'internal server error'
        })
    }
}


exports.read = async (req,res) => {
    const { id } = req.params
    try {
        const product = await Product.findById({_id:id})
          .populate("reviews")
          .orFail();
        res.json(product);
      } catch (err) {
        res.status(500).json({
            err:'internal server error'
        })
      }
}