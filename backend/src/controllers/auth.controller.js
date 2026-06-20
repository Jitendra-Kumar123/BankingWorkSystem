const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service.js");

async function userRegisterController(req, res){
    const {email , userName, password } = req.body;

    const isUserExists = await userModel.findOne({
        email: email
    })

    if(isUserExists){
        return res.status(422).json({
            message: "user already exists",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, userName, password
    })

    const token = jwt.sign({userId: user._id}, 
        
            process.env.JWT_SECRET
        ,
        {
            expiresIn: '3d'
        }
    )

    res.cookie("token", token);

    res.status(201).json({
        message: "user registered successfully",
        user: {
            userId: user._id,
            email: user.email,
            userName: user.userName
        }, 
        token
    })

    await emailService.sendUserRegistrationEmail(user.email, user.name);
}

async function userLoginController(req, res){
    const {email , password } = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(401).json({
            message: "email or password is invalid"
        })
    }

    const token = jwt.sign({userId: user._id}, 
        
            process.env.JWT_SECRET
        ,
        {
            expiresIn: '3d'
        }
    )

    res.cookie("token", token);

    res.status(200).json({
        message: "user loggedin successfully",
        user: {
            userId: user._id,
            email: user.email,
            userName: user.userName
        }, 
        token
    })
}


module.exports = {
    userRegisterController,
    userLoginController
}