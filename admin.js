import fetch from 'node-fetch';
import {State}    from './models/state.js';
import {nowTime} from './functions.js'
import {stateIs, lastAction, stateOn, stateOff} from './func_DB.js'
import 'dotenv/config';

//const Log = require('./models/log.js');
import mongoose from 'mongoose';

const db = process.env.DBPATH;
mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch((err) => console.log(err));

global.stateDB = process.env.PROCSTATE;

stateIs();
stateOn();
//lastAction();
//stateOff();
