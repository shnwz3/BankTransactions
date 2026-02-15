const accountModel = require('../models/account.model');

const createAccountController = async (req, res) => {
    try {
        const user = req.user;
        const account = await accountModel.create({
            userId: user._id,

        })
        res.status(201).json({ success: true, message: 'Account created successfully', account });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getMyAccountController = async (req, res) => {
    try {
        const account = await accountModel.findOne({ userId: req.user._id });
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        res.status(200).json({ success: true, message: 'Account fetched successfully', account });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getBalanceController = async (req, res) => {
    const { accountid } = req.params;
    try {
        let account = await accountModel.findOne({ _id: accountid });
        if (!account) {
            account = await accountModel.findOne({ userId: accountid });
        }
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        const balance = await account.getBalance();
        res.status(200).json({ success: true, message: 'Account fetched successfully', balance });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
module.exports = { createAccountController, getMyAccountController, getBalanceController };