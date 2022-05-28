import { order, submitOrder } from "@waves/waves-transactions";
import fetch from 'node-fetch';

export async function tryPlaceOrder(orderParams) {
    let signedOrder = order(orderParams, seed);
    let res = {};
    //console.log("trying with fee: " + signedOrder.matcherFee);
    try {
        await submitOrder(signedOrder, matcherUrl);
        console.log('placed order ID: '+ signedOrder.id);
        res.success = true;
        res.orderId = signedOrder.id;
    }
    catch (e) { 
        //console.log("placeOrder result: " + e.status); 
        //console.log("placeOrder message: " + JSON.stringify(e)); 
        res.success = false;
        res.orderId = '';
        res.errorType = `ERROR:${e.error} ${e.message}`;
    }
    return res; 

}

export async function getFee(orderParams) {
    let signedOrder       = order(orderParams, seed);
    //console.log("trying to get fee: " + signedOrder.matcherFee);
    try {
        await submitOrder(signedOrder, matcherUrl);
        console.log('placed order ID: '+ signedOrder.id);
    }
    catch (e) { 
        if (e.error == 9441542) {  // fee corection required
            let st = e.message.indexOf(" ") + 1; 
            let feee = parseInt(parseFloat(e.message.substring(st, e.message.indexOf(" ", st)))*10**8) + 10;
            /*console.log(e.message);
            console.log("required fee: " + feee );*/
            orderParams.matcherFee = feee;
            orderParams.feeCalculated = true; 
        }
        else {
            console.log(e.message);
            orderParams.error = e.message;
        }

    }
    return orderParams; 

}

export function nowTime() {
    //let date = new Date();
    let spl = new Date().toISOString().split('T');
    return spl[0] + " - " + spl[1];
}
export async function sleep(time) {
    return new Promise((resolve, reject) => setTimeout(resolve, time))
}
export async function orderStatus(orderCurr) {
    let res = {exists: false, status: 'empty'};
    if (orderCurr.id != ''){
        try {
            let response    = await fetch(matcherUrl + '/matcher/orderbook/' + amountAssetId + '/' + priceAssetId + '/' + orderCurr.id);
            let json        = await response.json();
            res.exists      = true;
            //console.log('Order status json: ' + json.status);
            res.status      = json.status;
        } catch (e) {
            console.log('orderStatus ERROR: ' + e.message);
            res.status = 'error';
        }
    }

    console.log("orderStatus: ", orderCurr.id, res.status);
    return res;
}