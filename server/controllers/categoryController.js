const { findByIdAndDelete } = require('../models/Category')
const Category = require('../models/Category')


exports.create = async (req,res) => {
    
    try {
        const {category} = req.body
        if(!category) {
            res.status(400).json({message:"Category input is required"})
        }
        const categoryExists = await Category.findOne({name: category})
        if(categoryExists) {
            res.status(400).json({message:"Category already exists"})
        } else {
            const categoryCreated = await Category.create({
                name: category
            })
            res.status(201).json({categoryCreated: categoryCreated})
        }
    } catch (err) {
        res.status(500).json({
            err:'internal server error'
        })
    }
       
    }
   



  exports.list = async(req,res) => {
    try {
        const categories = await Category.find({}).sort({name: "asc"}).orFail()
        res.json({categories})
    } catch (err) {
        res.status(500).json({
            err:'internal server error'
        })
       
    }
    
  }



  exports.removeCategory = async (req,res) => {
    // const { id } = req.params;
    try {
        if(req.params.category !== "Choose category") {
            const categoryExists = await Category.findOne({
                name: decodeURIComponent(req.params.category)
            }).orFail()
            await categoryExists.remove()
            res.json({categoryDeleted: true})
        }
    } catch (err) {
        res.status(500).json({
            error:'internal server error'
        })
       
    }
    
  }


  exports.saveAttr = async (req, res) => {
    const {key, val, categoryChoosen} = req.body
    if(!key || !val || !categoryChoosen) {
        return res.status(400).send("All inputs are required")
    }
    try {
        const category = categoryChoosen.split("/")[0]
        const categoryExists = await Category.findOne({name: category}).orFail()
        if(categoryExists.attrs.length > 0) {
            // if key exists in the database then add a value to the key
            var keyDoesNotExistsInDatabase = true
            categoryExists.attrs.map((item, idx) => {
                if(item.key === key) {
                    keyDoesNotExistsInDatabase = false
                    var copyAttributeValues = [...categoryExists.attrs[idx].value]
                    copyAttributeValues.push(val)
                    var newAttributeValues = [...new Set(copyAttributeValues)] // Set ensures unique values
                    categoryExists.attrs[idx].value = newAttributeValues
                }
            })

            if(keyDoesNotExistsInDatabase) {
                categoryExists.attrs.push({key: key, value: [val]})
            }
        } else {
            // push to the array
            categoryExists.attrs.push({key: key, value: [val]})
        }
        await categoryExists.save()
        let cat = await Category.find({}).sort({name: "asc"})
        return res.status(201).json({categoriesUpdated: cat})
    } catch(err) {
        res.status(500).json({
            error:'internal server error'
        })
    }
  }