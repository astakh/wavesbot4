import { Double } from 'bson';
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const stateSchema = new Schema ({
    working: {
        type: Boolean, 
    },
    actions: {
        type: String,
    }
    ,
    started: {
        type: String,
    }
    ,
    freased: {
        type: String,
    }
}, {timestamps: true});

export const State = mongoose.model('State', stateSchema);

