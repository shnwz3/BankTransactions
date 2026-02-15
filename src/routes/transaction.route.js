const { Router } = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");
const { transactionController, createInitialfundsTransaction } = require("../controllers/transaction.controller");

const transactionRouter = Router();

/*
* @route POST /api/transactions
* @description Create a new transaction
* @access Private
*/
transactionRouter.post('/', authMiddleware, transactionController);

transactionRouter.post('/system/initial-funds', authMiddleware, createInitialfundsTransaction)

module.exports = transactionRouter;