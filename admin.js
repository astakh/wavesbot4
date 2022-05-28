import fetch from 'node-fetch';
import {State}    from './models/state.js';
import {nowTime} from './functions.js'
import {stateIs, lastAction, stateOn, stateOff} from './func_DB.js'

//const Log = require('./models/log.js');
import mongoose from 'mongoose';

const db = 'mongodb+srv://admin:mongoDedperded999@cluster0.iq3e4.mongodb.net/WavesBot?retryWrites=true&w=majority';
mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch((err) => console.log(err));

global.stateDB = '6290c6a80914904a10cbb78f';

stateIs();
stateOn();
//lastAction();
//stateOff();
