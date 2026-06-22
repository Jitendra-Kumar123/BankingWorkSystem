const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const emailService = require("../services/email.service.js");

async function createTransaction(req, res){
    /** 1. Validate Request */
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "FromAccount, ToAccount, Amount and IdempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /** 2. Validate IdempotencyKey */ 
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status == "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already proecessed or completed"
            })
        }

        if(isTransactionAlreadyExists.status == "PEDING"){
            return res.status(200).json({
                message: "Transaction  is still processing"
            })
        }

        if(isTransactionAlreadyExists.status == "FAILED"){
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        if(isTransactionAlreadyExists.status == "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }        
        
    }

    /** 3. Check Account Status */
    if(fromUserAccount.status !== "ACTIVE" || !toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both fromUserAccount or toUserAccount must be ACTIVE for process transaction"
        })
    }
}

module.exports = createTransaction;