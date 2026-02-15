const mongoose = require('mongoose');
const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'account is required'],
        index: true, //unique index
        immutable: true //account cannot be changed
    },
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        immutable: true,
        index: true,
        ref: 'transaction'
    },
    type: {
        type: String,
        enum: { values: ['Debit', 'Credit'], message: 'Invalid type should be Debit or Credit' },
        default: 'Debit',
    },

}, {
    timestamps: true
})

const preventLedgerModification = () => {
    throw new Error('Ledger cannot be modified or deleted')
}
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('update', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('findOneAndReplace', preventLedgerModification)
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('findOneAndDelete', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification)

const ledgerModel = mongoose.model('ledger', ledgerSchema);
module.exports = ledgerModel;
