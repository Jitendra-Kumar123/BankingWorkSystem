const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        req.user = user;

        return next()
    }catch(err){
        console.log("authMiddleware error: ", err);
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden Access, not a system user"
            })
        }

        req.user = user;
        return next()
    }catch(err){
        return res.status(401).json({
            message: "Unauthorized Access, token is invalid"
        })
        console.log("system user middleware err: ", err);
    }
    
}

module.exports = {authMiddleware, authSystemUserMiddleware};