var express = require("express");
var router = express.Router();
const { check } = require("express-validator");  // check validation on route only
const { signout, signup, signin ,isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 3 char").isLength({ min: 3 }) //wildcard character all password condition to be done can be set here 
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "email is required").isEmail(),
    check("password", "password field is required").isLength({ min: 3 })
  ],
  signin
);

router.get("/signout", signout);

//protected route
router.get("/testroute", isSignedIn , (req,res) => { 
    //res.send("A protected routes")
    res.json(req.auth)  // returns _id and iat 
  })







module.exports = router;
