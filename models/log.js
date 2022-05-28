import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const logSchema = new Schema ({
    dealId: {
        type: String,
    },
    text: {
        type: String,
        required: true,
    }
}, {timestamps: true});

export const Log = mongoose.model('Log', logSchema);

//module.exports = Log;

