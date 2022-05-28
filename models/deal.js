import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const dealSchema = new Schema ({
    botId: {
        type: String,
        required: true,
    },
    stage: {
        type: Number,
        required: true,
    },
    finished: {
        type: Boolean,
        required: true,
    },
    orderInId: {
        type: String,
    },
    orderOutId: {
        type: String,
    }
}, {timestamps: true});

export const Deal = mongoose.model('Deal', dealSchema);

//module.exports = Log;

