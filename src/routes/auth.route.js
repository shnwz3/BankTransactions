const express = require('express');
const router = express.Router();

const { userResgisterController, userLoginController } = require('../controllers/auth.controller');

//register user
/* POST /api/auth/register */
router.post('/register', userResgisterController);

//login user
/* POST /api/auth/login */
router.post('/login', userLoginController);

module.exports = router;