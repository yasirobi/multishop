const Product = require('../models/Product')
const recordsPerPage = require('../utils/pagination')

exports.adminCreate = async (req, res) => {
  try {
    const product = new Product()
    const {
      name,
      description,
      count,
      price,
      category,
      attributesTable,
    } = req.body
    product.name = name
    product.description = description
    product.count = count
    product.price = price
    product.category = category
    if (attributesTable.length > 0) {
      attributesTable.map((item) => {
        product.attrs.push(item)
      })
    }
    await product.save()

    res.json({
      message: 'product created',
      productId: product._id,
    })
  } catch (err) {
    res.status(500).json({
      err: 'internal server error',
    })
  }
}

exports.getProducts = async (req, res) => {
  try {
    //price range filter
    let query = {}
    let queryCondition = false

    let priceQueryCondition = {}
    if (req.query.price) {
      queryCondition = true
      priceQueryCondition = { price: { $lte: Number(req.query.price) } }
    }

    //rating filter
    let ratingQueryCondition = {}
    if (req.query.rating) {
      queryCondition = true
      ratingQueryCondition = { rating: { $in: req.query.rating.split(',') } }
    }

    //choose category for search
    let categoryQueryCondition = {}
    const categoryName = req.params.categoryName || ''
    if (categoryName) {
      queryCondition = true
      let a = categoryName.replaceAll(',', '/')
      var regEx = new RegExp('^' + a)
      categoryQueryCondition = { category: regEx }
    }
    if (req.query.category) {
      queryCondition = true
      let a = req.query.category.split(',').map((item) => {
        if (item) return new RegExp('^' + item)
      })
      categoryQueryCondition = {
        category: { $in: a },
      }
    }

    //query by colors and weights
    let attrsQueryCondition = []
    if (req.query.attrs) {
      // attrs=RAM-1TB-2TB-4TB,color-blue-red
      // [ 'RAM-1TB-4TB', 'color-blue', '' ]
      attrsQueryCondition = req.query.attrs.split(',').reduce((acc, item) => {
        if (item) {
          let a = item.split('-')
          let values = [...a]
          values.shift() // removes first item
          let a1 = {
            attrs: { $elemMatch: { key: a[0], value: { $in: values } } },
          }
          acc.push(a1)
          // console.dir(acc, { depth: null })
          return acc
        } else return acc
      }, [])
      //   console.dir(attrsQueryCondition, { depth: null });
      queryCondition = true
    }


    //search queries
    const searchQuery = req.params.searchQuery || "";
    let searchQueryCondition = {};
    let select = {};
    if (searchQuery) {
      queryCondition = true;
      searchQueryCondition = { $text: { $search: searchQuery } };
      select = {
        score: { $meta: "textScore" },
      };
      sort = { score: { $meta: "textScore" } };
    }

    if (queryCondition) {
      query = {
        $and: [
          priceQueryCondition,
          ratingQueryCondition,
          categoryQueryCondition,
          searchQueryCondition,
          ...attrsQueryCondition,
          
        ],
      }
    }

    //pagination
    const pageNum = Number(req.query.pageNum) || 1

    //sort by name or price etc
    let sort = {}
    const sortOption = req.query.sort || ''
    if (sortOption) {
      let sortOpt = sortOption.split('_')
      sort = { [sortOpt[0]]: Number(sortOpt[1]) }
    }

    const totalProducts = await Product.countDocuments(query)
    const products = await Product.find(query)
      .select(select)
      .sort(sort) 
      .skip(recordsPerPage * (pageNum - 1))
      .limit(recordsPerPage)
    res.status(200).json({
      pageNum,
      paginationLinksNumber: Math.ceil(totalProducts / recordsPerPage),
      products
    })
  } catch (err) {
    res.status(500).json({
      err: 'internal server error',
    })
  }
}

exports.read = async (req, res) => {
  const { id } = req.params
  try {
    const product = await Product.findById({ _id: id })
      .populate('reviews')
      .orFail()
    res.json({product})
  } catch (err) {
    res.status(500).json({
      err: 'internal server error',
    })
  }
}



exports.getBestsellers = async (req, res) => {
    try {
      const products = await Product.aggregate([
        { $sort: { category: 1, sales: -1 } },
        {
          $group: { _id: "$category", doc_with_max_sales: { $first: "$$ROOT" } },
        },
        { $replaceWith: "$doc_with_max_sales" },
        { $match: { sales: { $gt: 0 } } },
        { $project: { _id: 1, name: 1, images: 1, category: 2, description: 1 } },
        { $limit: 3 },
      ]);
      res.status(200).json({
        products
    });
    } catch (err) {
        res.status(500).json({
            err: 'internal server error',
          })
    }
  };




  exports.adminGetProducts = async(req,res) => {

    try {
       const products = await Product.find({}) 
       .sort({ category : 1})
       .select('name price category')
       res.status(200).json({
        products
       })
    } catch (err) {
        res.status(500).json({
            err: 'internal server error',
          })
    }
  }


  exports.removeProduct = async (req,res) => {
    const { id } = req.params
    try {
        const products = await Product.findByIdAndRemove({_id:id}).orFail()
        res.status(200).json({
            message:'product deleted successfully'
        })
    } catch (err) {
        res.status(500).json({err:"internal server error"})
    }
  }




  exports.adminUpdateProduct = async (req,res) => {
    const { id } = req.params;
    try {
        const { name, description, count, price, category, attributesTable } = req.body;
        const product = await Product.findByIdAndUpdate({_id:id}, { name, description, count, price, category, attributesTable })
        const products = await product.find();
    res.status(200).json({products});
    } catch (err) {
        res.status(500).json({err:"internal server error"})
    }
  }