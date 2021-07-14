const express = require("express");
const router = express.Router();

const {getProductId , createProduct, getProduct ,photo, updateProduct,deleteProduct,getAllProducts ,getAllUniqueCategories} = require("../controllers/product")
const {isSignedIn,isAuthenticated,isAdmin } = require("../controllers/auth")
const { getUserById } = require("../controllers/user");
const { route } = require("./auth");

//all params
router.param("userId" ,getUserById);
router.param("productId",getProductId);

//all product route 
router.post("/product/create/:userId", isSignedIn,isAuthenticated,isAdmin ,createProduct )

//read routes
router.get("/product/:productId",getProduct);
router.get("/product/photo/:productId",photo)

//delete route 
router.delete("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin ,deleteProduct)
//update route
router.put("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin ,updateProduct)

//listing route
router.get("/products",getAllProducts)

router.get("/products/categories", getAllUniqueCategories)

module.exports = router;