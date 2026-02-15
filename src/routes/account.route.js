const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { createAccountController, getMyAccountController, getBalanceController } = require('../controllers/account.controller');

//create account
/* POST /api/accounts
protected
 */
router.post('/', authMiddleware, createAccountController);

//get my account
/* GET /api/accounts
protected
 */
router.get('/', authMiddleware, getMyAccountController);

router.get('/balance/:accountid', authMiddleware, getBalanceController)
module.exports = router;