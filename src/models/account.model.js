const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Account name must be associated with a user'],
        index: true,
        unique: true,

    },
    status: {
        type: String,
        enum: { values: ['ACTIVE', 'FROZEN', 'CLOSED'], message: 'Status must be ACTIVE, FROZEN, or CLOSED' },
        default: 'ACTIVE',
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'INR',
    },

}, {
    timestamps: true,
})

accountSchema.index({ userId: 1, status: 1 });

//method to get balance of an account
//aggregate pipeline to get balance of an account
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([
        //match all transactions by account
        {
            $match: {
                account: this._id
            }
        },
        //group all transactions by account
        {
            $group: {
                _id: null,
                totalDebits: { //sum all debits
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'Debit'] },//if type is debit then add amount else 0
                            '$amount',
                            0
                        ]
                    }
                },
                totalCredits: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'Credit'] },
                            '$amount',
                            0
                        ]
                    }
                }
            }
        },
        //project the balance
        {
            $project: {
                _id: 0,
                balance: { $subtract: ['$totalCredits', '$totalDebits'] }
            }
        }
    ])
    //if no transactions then balance is 0
    if (balanceData.length === 0) {
        return 0;
    }
    return balanceData[0].balance;
}

const accountModel = mongoose.model('Account', accountSchema);

module.exports = accountModel;