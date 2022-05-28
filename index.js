import { order, submitOrder } from "@waves/waves-transactions";
import fetch from 'node-fetch';
import {tryPlaceOrder, orderStatus, getFee, sleep} from './functions.js'
import {stateIs, lastAction} from './func_DB.js'
import {Log}    from './models/log.js';
import {State}  from './models/state.js';
import {Bot}    from './models/bot.js';
import {Deal}   from "./models/deal.js";

//const Log = require('./models/log.js');
import mongoose from 'mongoose';
const db = 'mongodb+srv://admin:mongoDedperded999@cluster0.iq3e4.mongodb.net/WavesBot?retryWrites=true&w=majority';
mongoose
    .connect(db)
    .then((res) => console.log('Connected to DB'))
    .catch((err) => console.log(err));

var wallet = ''
global.stateDB = '6290c6a80914904a10cbb78f';
global.matcherUrl = '';
global.matcherPublicKey = '';
global.amountAssetId = '';
global.priceAssetId = '';
global.seed      = '';
var mainNet = true;
if (mainNet) {
    wallet = '3PChxzwJzk3zr5wtnNic6Q8bezkqYf7XGFb'; // wavesDedperded999!
    matcherUrl = 'https://matcher.waves.exchange';
    matcherPublicKey = '9cpfKN9suPNvfeUNphzxXMjcnn974eme8ZhWUjaktzU5';
    amountAssetId = 'WAVES';
    priceAssetId = 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'; // USDN на Mainnet
    seed  = 'donate fold dismiss gain science weasel balance machine lecture host depth merit leisure net note';
}
else {
    wallet = '3N9RamRRAYUAD6fhGDUCAfiTxxLehuySTQg'; // testDedperded999! // Testnet
    matcherUrl = 'https://matcher-testnet.waves.exchange'; // Testnet
    matcherPublicKey = '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy'; // Testnet
    amountAssetId = 'WAVES';
    priceAssetId = '3KFXBGGLCjA5Z2DuW4Dq9fDDrHjJJP1ZEkaoajSzuKsC'; // USDN на Testnet
    seed  = 'tape craft angry head ability tip bag ensure bounce pistol steak grace fine cash design'; // Testnet
}
const usdt = '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ';
const usdn = 'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p';
const usdc = '6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ';
const wx   = "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on";
async function placeOrder(amountAssetId, priceAssetId, amount, price, orderType) {
    var orderParams = {
        // Фактическое количество amount-ассета нужно умножить на 10^amountAssetDecimals
        amount:             amount * 10**6, // 1 WAVES
        // Цену, выраженную в price-ассете, нужно умножить на 10^(8 + priceAssetDecimals – amountAssetDecimals)
        version: 3,
        price:              price, // 1,1 USDN за один WAVES
        amountAsset:        amountAssetId,
        priceAsset:         priceAssetId,
        matcherPublicKey:   matcherPublicKey,
        orderType:          orderType,
        matcherFee:         1,
        matcherFeeAssetId:  wx,
        feeCalculated:      false,
    }
    let res = {id: ''};
    orderParams = await getFee(orderParams);
    if (orderParams.feeCalculated) {
        let ord = await tryPlaceOrder(orderParams);
        if (ord.success) { console.log('Order placed');  res.id = ord.orderId; }
        else { 
            res.id = ''; 
            res.error = ord.errorType;
            //console.log(ord.errorType); 
        }
    }
    else { res.id = ''; res.error = 'fee not calculated'; console.log('fee not calculated' , orderParams.error); }
    return res;
}

async function toLog(dealId, text) {
    const log = new Log({dealId: dealId, text: text});
    log.save();
}

async function addBot( name, amountAsset, priceAsset, priceIn, priceOut, amount, run) {
    const bot = new Bot({
        name:           name, 
        amountAsset:    amountAsset,
        priceAsset:     priceAsset, 
        priceIn:        priceIn, 
        priceOut:       priceOut, 
        orderTypeIn:    orderTypeIn,
        orderTypeOut:   orderTypeOut,    
        amount:         amount, 
        run:            run});
    return await bot.save();
}
async function addDeal(botId) {
    const deal = new Deal({botId: botId, stage: 0, orderInId: '', orderOutId: '', finished: false});
    return await deal.save();
}

async function getBotDeals(botId) { return await Deal.find({botId: botId, finished: false}); }
async function getDeals() { return await Deal.find({finished: false}); }
async function getBots() { return await Bot.find({run: true}) }
async function getBotById(id) { return await Bot.findOne({_id: id}) }
async function startDeals() {
    let bots = await getBots();
    console.log(`We have ${bots.length} ready for work bots`);
    let deals;
    for (var i = 0; i < bots.length; i++) {
        //console.log(`Bot ${bots[i].name} ${bots[i]._id} :`);
        deals = await getBotDeals(bots[i]._id)
        if (deals.length ==0) {
            console.log(`Starting deal for ${bots[i].name}-Bot  `);
            await addDeal(bots[i]._id);
        }

    }

}

async function workDeals() {
    let deals = await getDeals();
    console.log(`Having ${deals.length} deals for work...`);
    let bot;
    let deal;
    let dealToModify;
    let order;
    let status;
    for (var i = 0; i < deals.length; i++) {
        deal = await deals[i];
        //console.log(`search for botId ${deal.botId}`);
        bot = await getBotById(deal.botId);
        console.log(bot.name + ':');
        if (deal.stage == 0) {
            order = await placeOrder(usdt, usdn, parseInt(bot.amount), parseInt(bot.priceIn * 10**8), 'buy');
            status = await orderStatus(order); 
            if (status.status == 'Accepted') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`);
                toLog(deal._id, `Buy order accepted`);
                dealToModify.orderInId  = order.id;
                dealToModify.stage      = 1;
                await dealToModify.save();
            }
            if (status.status == 'Filled') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`);
                dealToModify.orderInId  = order.id;
                dealToModify.stage      = 2;
                toLog(deal._id, `Buy order filled`);
                await dealToModify.save();
            }

        }
        if (deal.stage == 1) {
            status = await orderStatus({id: deal.orderInId}); 
            if (status.status == 'Filled') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`); 
                toLog(deal._id, `Buy order filled`);
                dealToModify.stage      = 2;
                await dealToModify.save();
            }
        }
        if (deal.stage == 2) {
            order   = await placeOrder(usdt, usdn, parseInt(bot.amount), parseInt(bot.priceOut * 10**8), 'sell');
            status  = await orderStatus(order); 
            if (status.status == 'Accepted') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`);
                dealToModify.orderOutId = order.id;
                dealToModify.stage      = 3;
                toLog(deal._id, `Sell order accepted`);
                await dealToModify.save();
            }
            if (status.status == 'Filled') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`);
                dealToModify.orderOutId  = order.id;
                dealToModify.stage      = 4;
                dealToModify.finished   = true;
                toLog(deal._id, `Sell order filled`);
                await dealToModify.save();
            }

        }
        if (deal.stage == 3) {
            status = await orderStatus({id: deal.orderOutId}); 
            if (status.status == 'Filled') {
                dealToModify = await Deal.findById(deal._id);
                console.log(`Modifying deal ${dealToModify._id}`);
                dealToModify.stage      = 4;
                toLog(deal._id, `Sell order filled`);
                await dealToModify.save();
            }
        }
    }
} 
async function runProc() {
    let working = await stateIs();
    if (working) console.log('Let`s work');
    let i = 0;
    while(working) {
        await lastAction();
        console.log('Round: ', i);
        working = await stateIs();
        await startDeals();
        await workDeals();
        i++;
        await sleep(5000);
        //if (i>10) {working=false;}
    }

}
//addBot('First', 1.01, 1.02, 1, true);
runProc(); 
//console.log(await getBotById(d)) 
//console.log(orderStatus({id: 'G7iuDdGpTVMQ6AF9eL3JuFowGRbcGJ7ak7fpuH5wsZ5'}))dd .