const {Router} = require('express');
const  authMiddleware  = require('../middlewares/auth.middleware');
const transactionController = require("../controllers/transaction.controller.js");

const transactionRoutes = Router();

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);

/** POST /api/transactions/system/intial-funds  
 * Create initial funds transaction from system user 
*/
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware,
     transactionController.createInitialFundsTransaction
    );

module.exports = transactionRoutes;