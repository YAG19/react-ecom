var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')

const { validationResult } = require("express-validator");
const User = require("../models/user");


exports.signup = (req, res) => {
    
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        }) //  422 Unprocessable Entity response status code indicates that the server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions
    }

  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: "NOT able to save user in DB"
      });
    }
    res.json({
      name: user.name,
      email: user.email,
      id: user._id
    });
  });
};

exports.signout = (req, res) => {
    res.clearCookie("token") // useing cookie parser
    res.json({
    message: "User signout sucessfuly"
  });
};


exports.signin = (req,res) =>{

    const { email , password} = req.body
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        }) 
    }

    User.findOne({email} , (err,user) => {
        if(err || !user){
           return res.status(400).json({
                error:"User email dose not exists"
            })
        }

    if(!user.autheticate(password)){
        return res.status(401).json({
            error:"email and password dose not match"
        })
    }
    //created a token
    const token = jwt.sign({ _id : user._id }, process.env.SECRETKEY )
    // put token in user cookie

    res.cookie("token" , token , { expire : new Date() + 9999 } ) // cookie to expire 


    //send response to frontend

    const { _id, name, email, role } = user;

    return res.json({
        token,
        user :{_id,name,email,role} 
   })

})
}



exports.isSignedIn = expressJwt({
    secret: process.env.SECRETKEY,
    userProperty : "auth"  // check it is authorized or not by saving this auth property in user browser
}) 

//custom middlewares
exports.isAuthenticated = (req,res,next) =>{

    let checker = req.profile && req.auth && req.profile._id == req.auth._id;     //profile is setup in frontend then to check user is signin sucessfully  req.auth_id so user can change its on account
    // console.log(req.auth._id , req.profile._id)
    if(!checker){
        return res.status(403).json({
            error:"ACESS DENIED"
        });
    }

    next();
  }

  exports.isAdmin = (req,res,next) => {
      if(req.profile.role === 0){
          return res.status(403).json({
              error: "NOT ADMIN // // ACCESS DENIED"
          })
      }
      next()
  }