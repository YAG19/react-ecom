const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash"); // _ private variable
const fs = require("fs"); // from node module

exports.getProductId = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm(); //err , feild , files  accepts three parameters
  form.keepExtensions = true; //check for extension of file

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with the file",
      });
    }

    //destructuring the fields
    const { name, description, price, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Feild is empty",
      });
    }

    // TODO: restriction on field
    let product = new Product(fields);
    // handle file here
    if (file.photo) {
      if (file.photo.size > 300000) {
        return res.status(400).json({
          error: "file size is greater than 3MB",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // saving file to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Saving tshirt in DB failed",
        });
      }
      res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware (performance optimization )
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};


exports.deleteProduct = (req, res) => {
    let product = req.product
    product.remove((err,deletedProduct) => {
        if(err){
            return res.status(400).json({
                error: "Failed to delete product"
            })
        }
        res.json({
            message:"deletion was Successful",
            deletedProduct
        })
    });
}

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm(); //err , feild , files  accepts three parameters
    form.keepExtensions = true; //check for extension of file

    form.parse(req, (err, fields, file) => {
        if (err) {
        return res.status(400).json({
            error: "problem with the file",
        });
        }

    let product =  req.product;

    product = _.extend(product,fields)
    // handle file here
    if (file.photo) {
      if (file.photo.size > 300000) {
        return res.status(400).json({
          error: "file size is greater than 3MB",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // saving file to db
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Updation of product in DB failed",
        });
      }
      res.json(product);
    });
  });
}

exports.getAllProducts = (req, res) => {
   let limit = parseInt(req.query.limit) && 8;
   let sortBy = req.query.sortBy && "_id";
    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy,"asc"]])
    .limit(limit)
    .exec((err,products) => {
        if(err) {
            return res.status(400).json({
                error: "No product Found"
            })   
        }
        res.json(products)
    })
}

exports.getAllUniqueCategories = (req,res) => {
    Product.distinct("category",{}, (err,category) => {
        if(err){
            return res.status(400).json({
                error: "category not found"
            })
        }
        res.json(category)
    })
}


exports.updateStock = (req, res, next) => {
    
    let myOperations = req.body.order.products.map( prod => {
        return {updateOne: {
            filter : {_id:prod._id},
            update : {$inc: {stock : -prod.count , sold:+prod.count}}
        }
    }
    })
    
    Product.bulkWrite( myOperations, {} , (err, products) => {
        if(err){
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }
        next();
    })
}