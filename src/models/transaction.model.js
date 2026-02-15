const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [function () { return !this.systemGenerated; }, 'account is required fromAccount'],
        index: true

    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'account is required toAccount'],
        index: true

    },
    systemGenerated: {
        type: Boolean,
        default: false
    },
    status: {
        type: 'String',
        enum: { values: ['Pending', 'Completed', 'Failed', 'Reversed'], message: 'Invalid status should be Pending, Completed, Failed, Reversed' },
        default: 'Pending'
    },
    amount: { //amount to be debited from fromAccount and credited to toAccount
        type: Number,
        required: [true, 'amount is required'],
        index: true
    },
    idempotencyKey: { //unique key to prevent duplicate transactions
        type: String,
        required: [true, 'idempotencyKey is required'],
        index: true
    }

}, {
    timestamps: true
})
const transactionModel = mongoose.model('Transaction', transactionSchema);
module.exports = transactionModel;
