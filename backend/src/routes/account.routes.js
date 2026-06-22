const express = require('express');
const accountController = require("../controllers/account.controller.js");
const authMiddleware = require('../middlewares/auth.middleware.js');


const router = express.Router();


router.post("/", authMiddleware.authMiddleware, accountController.createAccountController);



export default router;