const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const ledgerModel = require('../models/ledger.model');
const userModel = require('../models/user.model');
const { sendTransactionEmail, sendFailedTransactionEmail } = require('../services/gmail');
const mongoose = require('mongoose');

/**
 * @description Create a new transaction
 * @access Private
 * @route POST /api/transaction
 * @param {string} fromAccount - The account to debit
 * @param {string} toAccount - The account to credit
 * @param {number} amount - The amount to transfer
 * @param {string} idempotencyKey - The idempotency key
 * @returns {object} - The created transaction
 * 
 * 
 * 
 * ---10 STEPS FOR TRANSACTION---
 *1. validate request
  2. validate idempotencyKey 
  3. account status check
  4. derive sender balance from ledger
  5. create transaction using session (pending)
  6. create debit and credit ledger entries
  7. update transaction status (completed)
  8. commit transaction mongodb session
  9. end session
  10. send email notification
 */


const transactionController = async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        //validate required fields
        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const fromAccountData = await accountModel.findOne({ _id: fromAccount });
        const toAccountData = await accountModel.findOne({ _id: toAccount });
        if (!fromAccountData && !toAccountData) {
            return res.status(404).json({ message: 'Both Sender and Receiver Accounts not found' });
        }
        if (!fromAccountData) {
            return res.status(404).json({ message: 'Sender Account not found' });
        }
        if (!toAccountData) {
            return res.status(404).json({ message: 'Receiver Account not found' });
        }
        //validate idempotencyKey already exists 
        //validate idempotencyKey already exists 
        const transactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });
        if (transactionAlreadyExists) {
            //check if amount is different
            if (transactionAlreadyExists.amount !== amount) {
                return res.status(400).json({
                    message: "Transaction already exists with different amount",
                })
            }
            if (transactionAlreadyExists.status === 'Completed') {
                return res.status(200).json({
                    message: "Transaction already completed",
                    transaction: transactionAlreadyExists
                })
            }
            if (transactionAlreadyExists.status === 'Pending') {
                return res.status(200).json({
                    message: "Transaction is still pending",
                    transaction: transactionAlreadyExists
                })
            }
            if (transactionAlreadyExists.status === 'Failed') {
                return res.status(500).json({
                    message: "Transaction processing failed",
                    transaction: transactionAlreadyExists
                })
            }
            return res.status(200).json({
                message: "Transaction already exists",
                transaction: transactionAlreadyExists
            })
        }

        //account status check
        if ((fromAccountData && fromAccountData.status !== 'ACTIVE') || (toAccountData && toAccountData.status !== 'ACTIVE')) {
            return res.status(400).json({
                message: "Account is not active closed",
            })
        }

        //balance check
        const fromAccountBalance = await fromAccountData.getBalance();

        if (fromAccountBalance < amount) {
            return res.status(400).json({
                message: `Insufficient balance current balance is ${fromAccountBalance} 
                requested amount is ${amount}`,
            })
        }


        //create transaction using session
        const session = await mongoose.startSession(); //start session 
        session.startTransaction(); //start transaction

        //create transaction
        const transaction = new transactionModel({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'Pending'
        });

        //create ledger entries
        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount,
            type: 'Debit'
        }], { session });
        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount,
            type: 'Credit'
        }], { session });

        //update transaction status
        transaction.status = 'Completed';
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        //send email notification
        await sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount
        );

        return res.status(200).json({ message: 'Transaction created successfully', transaction });

    } catch (err) {
        await sendFailedTransactionEmail(
            req.user.email,
            req.user.name,
            req.body.amount,
            req.body.toAccount
        );
        return res.status(500).json({ message: err.message });
    }
};

const createInitialfundsTransaction = async (req, res) => {
    try {
        const { toAccount, amount, idempotencyKey } = req.body;

        //validate required fields
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        let toAccountData = await accountModel.findOne({ _id: toAccount });
        if (!toAccountData) {
            // Try finding by userId if not found by account _id
            toAccountData = await accountModel.findOne({ userId: toAccount });
            if (!toAccountData) {
                return res.status(404).json({ message: 'Receiver Account not found' });
            }
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = new transactionModel({
            toAccount: toAccountData._id,
            amount,
            idempotencyKey,
            status: 'Pending',
            systemGenerated: true
        });

        // Only create credit ledger entry for system generated transactions
        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccountData._id, //credit the user account
            amount: amount,
            transaction: transaction._id,
            type: 'Credit'
        }], { session });

        transaction.status = 'Completed';
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ message: 'Transaction created successfully', transaction });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = { transactionController, createInitialfundsTransaction };
