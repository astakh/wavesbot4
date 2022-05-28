import { Double } from 'bson';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const botSchema = new Schema ({
    name: {
        type: String, 
    },
    amountAsset: {
        type: String,
    },
    priceAsset: {
        type: String,
    },
    priceIn: {
        type: Number,
    },
    priceOut: {
        type: Number,
    },
    orderTypeIn: {
        type: String,
    },
    orderTypeOut: {
        type: String,
    },
    amount: {
        type: Number,
    },
    run: {
        type: Boolean,
    }
}, {timestamps: true});

export const Bot = mongoose.model('Bot', botSchema);

//module.exports = Log;

