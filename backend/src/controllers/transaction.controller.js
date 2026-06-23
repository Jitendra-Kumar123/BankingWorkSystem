const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const emailService = require("../services/email.service.js");
const mongoose = require('mongoose');

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
    
    /** 4. Derive Sender Balance from Ledger */
    const balance = await fromUserAccount.getBalance();

    if(balance < amount){
        return res.status(400).json({
            message: `Insufficient Balance, Current Balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /** 5. Create Transaction (PENDING - status) */
    const session = await mongoose.startSession();
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, {session})

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }, {session})    

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, {session})

    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    /** 10. Send Email Notification */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    return res.status(201).json({
        message: "Transaction Completed Successfully",
        transaction: transaction
    })

    /** 6. Create Debit Ledger Entry */
    /** 7. Create Credit Ledger Entry */
    /** 8. Mark Transaction Completed */
    /** 9. Commit MongoDB Session */
    /** 10. Send Email Notification */
}

async function createInitialFundsTransaction(req, res){

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
};