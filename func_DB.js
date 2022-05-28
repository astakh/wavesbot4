import fetch from 'node-fetch';
import {State}    from './models/state.js';
import {nowTime} from './functions.js'



export async function stateOn() {
    let s = await State.findById(stateDB);
    s.working = true;
    s.started = nowTime();
    await s.save();
    console.log(`Process started`);
}
export async function stateOff() {
    let s = await State.findById(stateDB);
    s.freased = nowTime();
    s.working = false;
    await s.save();
    console.log(`Process freased`);
}
export async function stateIs() {
    let s = await State.findById(stateDB);
    if (s.working) return true
    else return false;
}
export async function lastAction() {
    let s = await State.findById(stateDB);
    s.actions = nowTime();
    await s.save();
}

