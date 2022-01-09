class Trader{
    constructor(id){
        this.id = id;
        this.agression = Math.random()*100;
        this.position = 50000;
        this.cash = 200000;
    }

    decideToExecute(){
        let randomValue = Math.random()*100;
        if (this.agression >= randomValue) {
            return true;
        }   return false;
    }

    execute(){
        if (this.decideToExecute()){
            let sellBias = 1 + (bestBid - 7)  / 0.25 / 100;
            if(sellBias < 1) {
                sellBias = 1;
            }

            let buyBias = 1 + (7 - bestOffer) / 0.25 / 100;
            if(buyBias < 1) {
                buyBias = 1;
            }

            let positionToExecute = Math.round(Math.pow(Math.random(), 4) * 100000 + Math.pow(Math.random(), 3) * 10000 +
                Math.pow(Math.random(), 2) * 1000 + Math.random() * 100)

            positionToExecute *= this.agression / 100;
            positionToExecute =Math.round(positionToExecute);

            let direction = (Math.random() )  > 0.5 ? "Sell" : "Buy";
            if (direction === "Buy") {
                if (Math.random() * buyBias>0.99) {
                    this.sendBuyOrder(bestOffer, positionToExecute);
                } else {
                    let level = Math.round(priceLevels.length * Math.random());
                    // let margin = Math.round(((bestOffer - 6.75) / 0.01)) * Math.random() * (1 - this.agression / 100) * 0.01;
                    // let level = bestOffer - margin
                    // level = Math.round(level * 100) / 100;
                    this.sendBuyOrder(priceLevels[level].price, positionToExecute);
                }
            } else {
                if (Math.random() * sellBias>0.85) {
                    this.sendSellOrder(bestBid, positionToExecute);
                } else {
                    let level = Math.round(priceLevels.length * Math.random());
                    // let margin = Math.round(((7.25 - bestBid) / 0.01)) * Math.random() * (1 - this.agression / 100) * 0.01;
                    // let level = bestBid + margin
                    // level = Math.round(level * 100) / 100;
                    this.sendSellOrder(priceLevels[level].price, positionToExecute);
                }
            }
        } else {
            removeOrder(this.id);
        }
    }

    sendBuyOrder(price, amount){
        for (let i=0 ; i<priceLevels.length; i++){
            if(priceLevels[i].price === price.toString()) {
                priceLevels[i].buyForTrader(amount, this.id);
            }
        }
    }

    sendSellOrder(price, amount){
        for (let i=0 ; i<priceLevels.length; i++){
            if(priceLevels[i].price === price.toString()) {
                priceLevels[i].sellForTrader(amount, this.id);
            }
        }
    }
}

class Player{
    constructor(){
        this.position = 50000;
        this.netPosition = 0;
        this.cash = 200000;
        this.dayPnl = 0;
        this.selfTrade = 0;
        this.tradeHistorySide = [];
        this.tradeHistoryAmount = [];
        this.tradeHistoryPrice = [];
    }

    insertTrade(side, amount, price){
        this.tradeHistorySide.push(side);
        this.tradeHistoryAmount.push(amount);
        this.tradeHistoryPrice.push(price);
    }

    calculatePNL(){
        let cashFlow = 0;
        for (let i=0; i<this.tradeHistorySide.length; i++){
            if (this.tradeHistorySide[i]==="Buy"){
                cashFlow -= this.tradeHistoryAmount[i]*parseFloat(this.tradeHistoryPrice[i]);
            }
            else if (this.tradeHistorySide[i]==="Sell"){
                cashFlow += this.tradeHistoryAmount[i]*parseFloat(this.tradeHistoryPrice[i]);
            }
        }
        this.dayPnl = cashFlow + this.netPosition * parseFloat(bestBid + bestOffer) / 2
    }

}

class PriceLevel{
    constructor(price, tagId) {
        this.price = price;
        this.tagId = tagId;
        this.bidAmount = 0;
        this.offerAmount = 0;
        this.status = "empty";
        this.ownBid = 0;
        this.ownBidCount = 0;
        this.ownOffer = 0;
        this.ownOfferCount = 0;

        this.bidQueue = [];
        this.bidQueueNames =[];

        this.offerQueue = [];
        this.offerQueueNames = [];

        this.elemArray = [];

        for (let i =0; i<5; i++){
            let elem = document.getElementById(this.tagId.toString() + "-" + (i+1).toString());
            elem.style.userSelect = undefined;
            this.elemArray.push(elem);
        }

        this.elemArray[1].addEventListener(("click"), (e) =>{
            if (this.status === "Bid" || (this.status === "empty" && this.price<=bestOffer )){
                e.preventDefault()
                if (ableToBuy("P", leftClickSize * this.price, player.cash)) {
                    this.ownBid += leftClickSize;
                    this.ownBidCount += 1;
                    this.bidAmount += leftClickSize;
                    (this.bidQueue).push(leftClickSize);
                    (this.bidQueueNames).push("P");
                    this.fillTable();
                } else {
                    alert ("You don't have enough cash.");
                }
            } else {
                try {
                    e.preventDefault();
                    let amount = this.buyTransaction(leftClickSize);
                    this.fillTable();
                    while (amount) {
                        amount = this.buyTransaction(amount);
                        this.fillTable();
                    }
                    this.fillTable();
                } catch(e){
                    alert (e);
                }

            }
        })
        this.elemArray[1].addEventListener(("contextmenu"), (e) => {
            if (this.status === "Bid" || (this.status === "empty" && this.price<=bestOffer )){
                e.preventDefault()
                if (ableToBuy("P", rightClickSize * this.price, player.cash)) {
                    this.ownBid += rightClickSize;
                    this.ownBidCount += 1;
                    this.bidAmount += rightClickSize;
                    (this.bidQueue).push(rightClickSize);
                    (this.bidQueueNames).push("P");
                    this.fillTable();
                }   else {
                        alert ("You don't have enough cash.");
                }
            }   else {
                try {
                    e.preventDefault();
                    let amount = this.buyTransaction(rightClickSize);
                    this.fillTable();
                    while (amount) {
                        amount = this.buyTransaction(amount);
                        this.fillTable();
                    }
                    this.fillTable();
                } catch(e){
                    alert (e);
                }
            }
        })
        this.elemArray[0].addEventListener(("contextmenu"), (e) => {
            if (this.status === "Bid" || this.status === "empty") {
                e.preventDefault()
                this.removeOwnBidFromQueue();
                this.fillTable();
            }
        })

        this.elemArray[3].addEventListener(("click"), (e) => {
            if (this.status === "Offer" || (this.status === "empty" && this.price>=bestBid )){
                if (ableToSell("P", leftClickSize, player.position)) {
                    e.preventDefault()
                    this.ownOffer += leftClickSize;
                    this.ownOfferCount += 1;
                    this.offerAmount += leftClickSize;
                    (this.offerQueue).push(leftClickSize);
                    (this.offerQueueNames).push("P");
                    this.fillTable();
                } else {
                    alert("You don't have enough stock.")
                }
            } else {
                try {
                    e.preventDefault();
                    let amount = this.sellTransaction(leftClickSize);
                    this.fillTable();
                    while (amount) {
                        amount = this.sellTransaction(amount);
                        this.fillTable();
                    }
                    this.fillTable();
                } catch (e){
                    alert(e);
                }

            }
        })

        this.elemArray[3].addEventListener(("contextmenu"), (e) => {
            if (this.status === "Offer" || (this.status === "empty" && this.price>=bestBid )){
                if (ableToSell("P", rightClickSize, player.position)) {
                    e.preventDefault()
                    this.ownOffer += rightClickSize;
                    this.ownOfferCount += 1;
                    this.offerAmount += rightClickSize;
                    (this.offerQueue).push(rightClickSize);
                    (this.offerQueueNames).push("P");
                    this.fillTable();
                } else {
                    alert("You don't have enough stock.");
                }
            }else {
                try{
                    e.preventDefault();
                    let amount = this.sellTransaction(rightClickSize);
                    this.fillTable();
                    while (amount) {
                        amount = this.sellTransaction(amount);
                        this.fillTable();
                    }
                    this.fillTable();
                } catch (e){
                    alert(e);
                }
            }
        })

        this.elemArray[4].addEventListener(("contextmenu"), (e) => {
            if (this.status === "Offer" || this.status === "empty") {
                e.preventDefault()
                this.removeOwnOfferFromQueue();
                this.fillTable();
            }
        })

    }

    buyForTrader(amount, id){
        if (this.status === "Bid" || (this.status === "empty" && this.price<=bestOffer )){
            (this.bidQueue).push(amount);
            (this.bidQueueNames).push("T" + id.toString());
            this.calculateTotalBid();
            this.fillTable();
        } else {
            let amountNew = this.buyTransactionForTrader(amount, id);
            this.fillTable();
            while (amountNew) {
                amountNew = this.buyTransactionForTrader(amountNew, id);
                this.fillTable();
            }
            this.fillTable();
        }
    }

    sellForTrader(amount, id){
        if (this.status === "Offer" || (this.status === "empty" && this.price>=bestBid )){
            (this.offerQueue).push(amount);
            (this.offerQueueNames).push("T" + id.toString());
            this.calculateTotalOffer();
            this.fillTable();
        } else {
            let amountNew = this.sellTransactionForTrader(amount, id);
            this.fillTable();
            while (amountNew) {
                amountNew = this.sellTransactionForTrader(amountNew, id);
                this.fillTable();
            }
            this.fillTable();
        }
    }

    removeOwnBidFromQueue(){
        for (let i = 0; i<this.bidQueue.length ; i++) {
            if (this.bidQueueNames[i] === "P") {
                this.bidAmount -= this.bidQueue[i];
                this.ownBid -= this.bidQueue[i];
                this.ownBidCount -= 1;
                this.bidQueue = splitArray(this.bidQueue, i);
                this.bidQueueNames = splitArray(this.bidQueueNames, i);
                i--;
            }
        }
    }

    removeOwnOfferFromQueue(){
        for (let i = 0; i<this.offerQueue.length ; i++) {
            if (this.offerQueueNames[i] === "P") {
                this.offerAmount -= this.offerQueue[i];
                this.ownOffer -= this.offerQueue[i];
                this.ownOfferCount -= 1;
                this.offerQueue = splitArray(this.offerQueue, i);
                this.offerQueueNames = splitArray(this.offerQueueNames, i);
                i--;
            }
        }
    }

    fillTable(){
        updateUserConsole();
        this.elemArray[2].style.fontSize = "14px";
        this.elemArray[2].style.fontFamily = 'Tahoma, Verdana, sans-serif';
        this.elemArray[2].innerHTML = this.price;

        if (this.ownBid !== 0 ) {
            this.elemArray[0].style.fontSize = "14px";
            this.elemArray[0].style.fontFamily = 'Tahoma, Verdana, sans-serif';
            this.elemArray[0].innerHTML = this.ownBid + " (" + this.ownBidCount + ")";
        } else {
            this.elemArray[0].innerHTML = ""
        }

        if (this.ownOffer !== 0 ) {
            this.elemArray[4].style.fontSize = "14px";
            this.elemArray[4].style.fontFamily = 'Tahoma, Verdana, sans-serif';
            this.elemArray[4].innerHTML = this.ownOffer + " (" + this.ownOfferCount + ")";
        } else {
            this.elemArray[4].innerHTML = ""
        }

        if (this.bidAmount !== 0 ){
            this.elemArray[1].style.fontSize = "14px";
            this.elemArray[1].style.fontFamily = 'Tahoma, Verdana, sans-serif';
            this.elemArray[1].innerHTML = this.bidAmount;
        } else {
            this.elemArray[1].innerHTML = "";
        }

        if (this.offerAmount !== 0 ){
            this.elemArray[3].style.fontSize = "14px";
            this.elemArray[3].style.fontFamily = 'Tahoma, Verdana, sans-serif';
            this.elemArray[3].innerHTML = this.offerAmount;
        }else {
            this.elemArray[3].innerHTML = "";
        }

        checkBestBidAndBestOffer();
        this.colorSet();
    }

    calculateStatus(){
        if (this.bidAmount>this.offerAmount){
            this.status = "Bid";
        } else if (this.bidAmount<this.offerAmount){
            this.status = "Offer";
        } else {
            this.status = "empty";
        }
    }

    colorSet(){
        if(this.status === "Offer"){
            for (let i =0; i<5; i++){
                this.elemArray[i].style.backgroundColor = "rgb(153, 204, 255)"
            }
        }
        else if(this.status === "Bid"){
            for (let i =0; i<5; i++){
                this.elemArray[i].style.backgroundColor = "rgb(255, 255, 100)"
            }
        } else {
            for (let i =0; i<5; i++){
                this.elemArray[i].style.backgroundColor = "rgb(255, 255, 255)"
            }
        }
    }

    checkBidAskValues(){
        this.calculateStatus();
        if (this.status === "Bid" && this.price > bestBid) {
            bestBid = this.price
        }
        if (this.status === "Offer" && this.price < bestOffer){
            bestOffer = this.price
        }
    }

    buyTransaction(amount){
        if (this.price > bestOffer) {
            for (let i = 0; i<priceLevels.length; i++){
                if (priceLevels[i].price === bestOffer) {
                    if (ableToBuy("P", this.price*amount, player.cash)){
                        amount = priceLevels[i].buyTransaction(amount);
                        return amount;
                    } else {
                        throw new Error("You don't have enough cash");
                    }
                }
            }
        } else if (this.status === "empty") {
            if (ableToBuy("P", this.price*amount, player.cash)) {
                this.bidAmount += amount;
                this.ownBidCount += 1;
                this.ownBid += amount;
                this.bidQueue.push(amount);
                this.bidQueueNames.push("P");
                amount = 0;
                this.fillTable();
                return amount;
            } else {
                throw new Error("You don't have enough cash");
            }
        }   else {
            for (let i=0; i<this.offerQueue.length ; i++) {
                if (this.offerQueueNames[i] === "P") {
                    let value = this.offerQueue[i];
                    if (value > amount) {
                        if (ableToBuy("P", priceLevels[i].price*amount, player.cash)) {
                            insertLogText("Player", "Buy", this.price, amount)
                            this.offerQueue[i] = value - amount;
                            this.ownOffer -= amount;
                            this.calculateTotalOffer();
                            this.fillTable();
                            player.selfTrade += amount * this.price;
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough cash");
                        }
                    } else if (value === amount) {
                        if (ableToBuy("P", this.price*amount, player.cash)) {
                            insertLogText("Player", "Buy", this.price, amount)
                            this.ownOffer -= amount;
                            this.ownOfferCount -= 1;
                            this.offerQueue = splitArray(this.offerQueue, i);
                            this.offerQueueNames = splitArray(this.offerQueueNames, i);
                            this.calculateTotalOffer();
                            this.fillTable();
                            i--;
                            player.selfTrade += amount * this.price;
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough cash");
                        }
                    } else {
                        if (ableToBuy("P", this.price*value, player.cash)) {
                            insertLogText("Player", "Buy", this.price, value)
                            this.ownOffer -= value;
                            this.ownOfferCount -= 1;
                            this.offerQueue = splitArray(this.offerQueue, i);
                            this.offerQueueNames = splitArray(this.offerQueueNames, i);
                            this.calculateTotalOffer();
                            this.fillTable();
                            i--;
                            player.selfTrade += value * this.price;
                            amount -= value;
                        }  else {
                            throw new Error("You don't have enough cash");
                        }
                    }
                }
                if (this.offerQueueNames[i][0] === "T") {
                    let value = this.offerQueue[i];
                    if (value > amount) {
                        if (ableToBuy("P", this.price*amount, player.cash)) {
                            insertLogText("Player", "Buy", this.price, amount)
                            player.insertTrade("Buy", amount, this.price);
                            player.calculatePNL();
                            this.offerQueue[i] = value - amount;
                            player.position += amount;
                            player.netPosition += amount;
                            player.cash -= (this.price * amount);
                            this.calculateTotalOffer();
                            this.fillTable();
                            amount = 0;
                        }   else {
                            throw new Error("You don't have enough cash");
                        }
                    } else if (value === amount) {
                        if (ableToBuy("P", this.price*amount, player.cash)) {
                            insertLogText("Player", "Buy", this.price, amount)
                            player.insertTrade("Buy", amount, this.price);
                            player.calculatePNL();
                            player.position += amount;
                            player.netPosition += amount;
                            player.cash -= (this.price * amount);
                            this.offerQueue = splitArray(this.offerQueue, i);
                            this.offerQueueNames = splitArray(this.offerQueueNames, i);
                            this.calculateTotalOffer();
                            this.fillTable();
                            i--;
                            amount = 0;
                        }   else {
                            throw new Error("You don't have enough cash");
                        }
                    } else {
                        if (ableToBuy("P", this.price*value, player.cash)) {
                            insertLogText("Player", "Buy", this.price, value)
                            player.insertTrade("Buy", value, this.price);
                            player.calculatePNL();
                            player.position += value;
                            player.netPosition += value;
                            player.cash -= (this.price * value);
                            this.offerQueue = splitArray(this.offerQueue, i);
                            this.offerQueueNames = splitArray(this.offerQueueNames, i);
                            this.calculateTotalOffer();
                            this.fillTable();
                            i--;
                            amount -= value;
                        }   else {
                            throw new Error("You don't have enough cash");
                        }
                    }
                }
                if (amount === 0 || this.offerQueue.length === 0) {
                    return amount;
                }
            }
            return amount;
        }
    }

    sellTransaction(amount){
        if (this.price < bestBid) {
            for (let i = 0; i<priceLevels.length; i++){
                if (priceLevels[i].price === bestBid) {
                    if (ableToSell("P", amount, player.position)) {
                        amount = priceLevels[i].sellTransaction(amount);
                        return amount;
                    } else {
                        throw new Error("You don't have enough stock.")
                    }
                }
            }
        } else if (this.status === "empty") {
            if (ableToSell("P", amount, player.position)) {
                this.offerAmount += amount;
                this.ownOfferCount += 1;
                this.ownOffer += amount;
                this.offerQueue.push(amount);
                this.offerQueueNames.push("P");
                amount = 0;
                this.fillTable();
                return amount;
            } else {
                throw new Error("You don't have enough stock.")
            }
        }   else {
            for (let i=0; i<this.bidQueue.length ; i++) {
                if (this.bidQueueNames[i] === "P") {
                    let value = this.bidQueue[i];
                    if (value > amount) {
                        if (ableToSell("P", amount, player.position)) {
                            insertLogText("Player", "Sell", this.price, amount)
                            this.bidQueue[i] = value - amount;
                            this.ownBid -= amount;
                            this.calculateTotalBid();
                            this.fillTable();
                            player.selfTrade += amount * this.price;
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    } else if (value === amount) {
                        if (ableToSell("P", amount, player.position)) {
                            insertLogText("Player", "Sell", this.price, amount)
                            this.ownBid -= amount;
                            this.ownBidCount -= 1;
                            this.bidQueue = splitArray(this.bidQueue, i);
                            this.bidQueueNames = splitArray(this.bidQueueNames, i);
                            this.calculateTotalBid();
                            this.fillTable();
                            i--;
                            player.selfTrade += amount * this.price;
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    } else {
                        if (ableToSell("P", value, player.position)) {
                            insertLogText("Player", "Sell", this.price, value);
                            this.ownBid -= value;
                            this.ownBidCount -= 1;
                            this.bidQueue = splitArray(this.bidQueue, i);
                            this.bidQueueNames = splitArray(this.bidQueueNames, i);
                            this.calculateTotalBid();
                            this.fillTable();
                            i--;
                            player.selfTrade += value * this.price;
                            amount -= value;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    }
                }
                if (this.bidQueueNames[i][0] === "T") {
                    let value = this.bidQueue[i];
                    if (value > amount) {
                        if (ableToSell("P", amount, player.position)) {
                            insertLogText("Player", "Sell", this.price, amount)
                            player.insertTrade("Sell", amount, this.price);
                            player.calculatePNL();
                            this.bidQueue[i] = value - amount;
                            player.position -= amount;
                            player.netPosition -= amount;
                            player.cash += (this.price * amount);
                            this.calculateTotalBid();
                            this.fillTable();
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    } else if (value === amount) {
                        if (ableToSell("P", amount, player.position)) {
                            insertLogText("Player", "Sell", this.price, amount)
                            player.insertTrade("Sell", amount, this.price);
                            player.calculatePNL();
                            player.position -= amount;
                            player.netPosition -= amount;
                            player.cash += (this.price * amount);
                            this.bidQueue = splitArray(this.bidQueue, i);
                            this.bidQueueNames = splitArray(this.bidQueueNames, i);
                            this.calculateTotalBid();
                            this.fillTable();
                            i--;
                            amount = 0;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    } else {
                        if (ableToSell("P", value, player.position)) {
                            insertLogText("Player", "Sell", this.price, value)
                            player.insertTrade("Sell", value, this.price);
                            player.calculatePNL();
                            player.position -= value;
                            player.netPosition -= value;
                            player.cash += (this.price * value);
                            this.bidQueue = splitArray(this.bidQueue, i);
                            this.bidQueueNames = splitArray(this.bidQueueNames, i);
                            this.calculateTotalBid();
                            this.fillTable();
                            i--;
                            amount -= value;
                        } else {
                            throw new Error("You don't have enough stock.")
                        }
                    }
                }
                if (amount === 0 || this.bidQueue.length === 0) {
                    return amount;
                }
            }
            return amount;
        }
    }

    buyTransactionForTrader(amount, id){
        if (this.price > bestOffer) {
            for (let i = 0; i<priceLevels.length; i++){
                if (priceLevels[i].price === bestOffer) {
                    amount = priceLevels[i].buyTransactionForTrader(amount, id);
                    return amount;
                }
            }
        } else if (this.status === "empty") {
            this.bidAmount += amount;
            this.bidQueue.push(amount);
            this.bidQueueNames.push("T");
            amount = 0;
            this.fillTable();
            return amount;
        }   else {
            for (let i=0; i<this.offerQueue.length ; i++) {
                if (this.offerQueueNames[i] === "P") {
                    let value = this.offerQueue[i];
                    if (value > amount) {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, amount)
                        player.insertTrade("Sell", amount, this.price);
                        player.calculatePNL();
                        this.offerQueue[i] = value - amount;
                        player.position -= amount;
                        player.netPosition -= amount;
                        player.cash += amount * this.price
                        this.ownOffer -= amount;
                        this.calculateTotalOffer();
                        this.fillTable();
                        amount=0;
                    } else if (value === amount) {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, amount)
                        player.insertTrade("Sell", amount, this.price);
                        player.calculatePNL();
                        this.ownOffer -= amount;
                        this.ownOfferCount -= 1;
                        this.offerQueue = splitArray(this.offerQueue, i);
                        this.offerQueueNames = splitArray(this.offerQueueNames, i);
                        player.position -= amount;
                        player.netPosition -= amount;
                        player.cash += amount * this.price
                        this.calculateTotalOffer();
                        this.fillTable();
                        i--;
                        amount = 0;
                    } else {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, value)
                        player.insertTrade("Sell", value, this.price);
                        player.calculatePNL();
                        this.ownOffer -= value;
                        this.ownOfferCount -= 1;
                        player.position -= value;
                        player.netPosition -= value;
                        player.cash += value * this.price
                        this.offerQueue = splitArray(this.offerQueue, i);
                        this.offerQueueNames = splitArray(this.offerQueueNames, i);
                        this.calculateTotalOffer();
                        this.fillTable();
                        i--;
                        amount -= value;
                    }
                    if (amount === 0 || this.offerQueueNames.length === 0) {
                        return amount;
                    }
                }
                if (this.offerQueueNames[i][0] === "T") {
                    let value = this.offerQueue[i];
                    if (value > amount) {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, amount)
                        this.offerQueue[i] = value - amount;
                        this.calculateTotalOffer();
                        this.fillTable();
                        amount=0;
                    } else if (value === amount) {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, amount)
                        this.offerQueue = splitArray(this.offerQueue, i);
                        this.offerQueueNames = splitArray(this.offerQueueNames, i);
                        this.calculateTotalOffer();
                        this.fillTable();
                        i--;
                        amount = 0;
                    } else {
                        insertLogText("Trader "+ id.toString(), "Buy", this.price, value)
                        this.offerQueue = splitArray(this.offerQueue, i);
                        this.offerQueueNames = splitArray(this.offerQueueNames, i);
                        this.calculateTotalOffer();
                        this.fillTable();
                        i--;
                        amount -= value;
                    }
                }
                if (amount === 0 || this.offerQueueNames.length === 0) {
                    return amount;
                }
            }
            return amount;
        }
    }

    sellTransactionForTrader(amount, id){
        if (this.price < bestBid) {
            for (let i = 0; i<priceLevels.length; i++){
                if (priceLevels[i].price === bestBid) {
                    amount = priceLevels[i].sellTransactionForTrader(amount, id);
                    return amount;
                }
            }
        } else if (this.status === "empty") {
            this.offerAmount += amount;
            this.offerQueue.push(amount);
            this.offerQueueNames.push("T");
            amount = 0;
            this.fillTable();
            return amount;
        }   else {
            for (let i=0; i<this.bidQueue.length ; i++) {
                if (this.bidQueueNames[i] === "P") {
                    let value = this.bidQueue[i];
                    if (value > amount) {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, amount)
                        player.insertTrade("Buy", amount, this.price);
                        player.calculatePNL();
                        this.bidQueue[i] = value - amount;
                        player.position += amount;
                        player.netPosition += amount;
                        player.cash -= amount * this.price
                        this.ownBid -= amount;
                        this.calculateTotalBid();
                        this.fillTable();
                        amount=0;
                    } else if (value === amount) {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, amount)
                        player.insertTrade("Buy", amount, this.price);
                        player.calculatePNL();
                        this.ownBid -= amount;
                        this.ownBidCount -= 1;
                        this.bidQueue = splitArray(this.bidQueue, i);
                        this.bidQueueNames = splitArray(this.bidQueueNames, i);
                        player.position += amount;
                        player.netPosition += amount;
                        player.cash -= amount * this.price
                        this.calculateTotalBid();
                        this.fillTable();
                        i--;
                        amount = 0;
                    } else {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, value)
                        player.insertTrade("Buy", value, this.price);
                        player.calculatePNL();
                        this.ownBid -= value;
                        this.ownBidCount -= 1;
                        player.position += value;
                        player.netPosition += value;
                        player.cash -= value * this.price
                        this.bidQueue = splitArray(this.bidQueue, i);
                        this.bidQueueNames = splitArray(this.bidQueueNames, i);
                        this.calculateTotalBid();
                        this.fillTable();
                        i--;
                        amount -= value;
                    }
                    if (amount === 0 || this.bidQueueNames.length === 0) {
                        return amount;
                    }
                }
                if (this.bidQueueNames[i][0] === "T") {
                    let value = this.bidQueue[i];
                    if (value > amount) {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, amount)
                        this.bidQueue[i] = value - amount;
                        this.calculateTotalBid();
                        this.fillTable();
                        amount=0;
                    } else if (value === amount) {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, amount)
                        this.bidQueue = splitArray(this.bidQueue, i);
                        this.bidQueueNames = splitArray(this.bidQueueNames, i);
                        this.calculateTotalBid();
                        this.fillTable();
                        i--;
                        amount = 0;
                    } else {
                        insertLogText("Trader "+ id.toString(), "Sell", this.price, value)
                        this.bidQueue = splitArray(this.bidQueue, i);
                        this.bidQueueNames = splitArray(this.bidQueueNames, i);
                        this.calculateTotalBid();
                        this.fillTable();
                        i--;
                        amount -= value;
                    }
                }
                if (amount === 0 || this.bidQueue.length === 0) {
                    return amount;
                }
            }
            return amount;
        }
    }

    calculateTotalOffer(){
        this.offerAmount = this.offerQueue.reduce((a, b) => a + b, 0);
    }

    calculateTotalBid(){
        this.bidAmount = this.bidQueue.reduce((a, b) => a + b, 0);
    }
}

var orderbook;

var totalPriceLevels = 51;
var title = "STOCK_NAME.E";
var leftClickSize = 1;
var rightClickSize = 1;
var traderCount = 100;

var bestBid = 6.76;
var bestOffer = 7.25;

var body = document.getElementById("html-body");
var userConsole = document.getElementById("user-console");

function insertNewRow(rowId){
    let newRow = document.createElement("tr")
    for (let i=0; i<5; i++){
        insertNewColumn(newRow, rowId, i+1);
    }
    orderbook.appendChild(newRow);
}

function insertNewColumn(newRow, rowId, columnId){
    let newColumn = document.createElement("th")
    newColumn.style.width = "70px";
    newColumn.style.height = "22px";
    newColumn.style.border = "1px solid black";
    newColumn.style.borderCollapse = "collapse";
    newColumn.id = rowId.toString() + "-" + columnId.toString();
    newRow.appendChild(newColumn);
}

function insertNewLine(tag, number){
    for (let i = 0; i<number; i++){
        let br = document.createElement("br");
        tag.appendChild(br);
    }
}

function removeOrder(id){
    for (let i = 0; i<priceLevels.length; i++){
        for (let j=priceLevels[i].bidQueue.length - 1; j>=0; j--){
            if (priceLevels[i].bidQueueNames[j] === "T" + id.toString()){
                console.log("Deleted amount" + priceLevels[i].bidQueue[j] + " from " + id.toString())
                splitArray(priceLevels[i].bidQueueNames, j)
                splitArray(priceLevels[i].bidQueue, j)
                priceLevels[i].calculateTotalBid();
                priceLevels[i].fillTable();
                return;
            }
        }
        for (let j=priceLevels[i].offerQueue.length - 1; j>=0; j--){
            if (priceLevels[i].offerQueueNames[j] === "T" + id.toString()){
                console.log("Deleted amount" + priceLevels[i].offerQueue[j] + " from " + id.toString())
                splitArray(priceLevels[i].offerQueueNames, j)
                splitArray(priceLevels[i].offerQueue, j)
                priceLevels[i].calculateTotalBid();
                priceLevels[i].fillTable();
                return;
            }
        }
    }
}

function removeAllElements(tag) {
    let count = tag.childNodes.length;
    for (let i = 0; i<count; i++){
        tag.removeChild(tag.childNodes[0]);
    }
}

function splitArray(array, index) {
    return (array.slice(0, index)).concat((array.slice(index+1)));
}

function checkBestBidAndBestOffer(){
    bestBid = 6.76;
    bestOffer = 7.25;
    priceLevels.forEach((priceLevel)=>{
        priceLevel.checkBidAskValues();
    })
}

function changeFontAddText(tag, text){
    tag.style.fontSize = "14px";
    tag.style.fontFamily = 'Tahoma, Verdana, sans-serif';
    tag.innerHTML = text;
    tag.style.backgroundColor="rgb(220,220,220)"
}

function calculateTotalOfferAmount(id){
    let sum = 0;
    priceLevels.forEach((priceLevel)=>{
        let count = 0;
        priceLevel.offerQueueNames.forEach((elem)=>{
            if (elem === id){
                sum += priceLevel.offerQueue[count];
            }
            count++;
        })
    })
    return sum;
}

function calculateTotalBidAmount(id){
    let sum = 0;
    priceLevels.forEach((priceLevel)=>{
        let count = 0;
        priceLevel.bidQueueNames.forEach((elem)=>{
            if (elem === id){
                sum += priceLevel.bidQueue[count]*priceLevel.price;
            }
            count++;
        })
    })
    return sum;
}

function ableToBuy(id, compareValue, cash){
    let cashExisting = calculateTotalBidAmount(id);
    if (cash - cashExisting >= compareValue) {
        return true;
    }
    return false;
}

function ableToSell(id, compareValue, stock){
    let stockExisting = calculateTotalOfferAmount(id);
    if (stock - stockExisting >= compareValue) {
        return true;
    }
    return false;
}


function createOrderBook(){
    orderbook = document.getElementById("orderbook");
    orderbook.style.position = "absolute";
    orderbook.style.marginLeft = "450px";
    orderbook.style.marginTop = "5%";
    orderbook.style.border = "1px solid black";
    orderbook.style.borderCollapse = "collapse";
    let caption = document.createElement("caption")
    caption.innerHTML = title;
    caption.style.marginBottom = "5px"
    orderbook.appendChild(caption);
    for (let i=0 ; i<totalPriceLevels; i++){
        insertNewRow(i+1);
    }
    changeFontAddText(document.getElementById("1-1"), "Own Bid")
    changeFontAddText(document.getElementById("1-2"), "Bid")
    changeFontAddText(document.getElementById("1-3"), "Price")
    changeFontAddText(document.getElementById("1-4"), "Ask")
    changeFontAddText(document.getElementById("1-5"), "Own Ask")
    let newParagraph = document.createElement("pre");
    newParagraph.style.position = "absolute";
    newParagraph.style.marginTop = "1500px";
    newParagraph.style.marginLeft = window.innerWidth.toString() + "px";
    newParagraph.innerHTML = " "
    body.appendChild(newParagraph);
}


function clickLeftSizeSet(){
    let clickSizeInput = document.createElement("input")
    clickSizeInput.type="text";
    clickSizeInput.style.textAlign = "center";
    clickSizeInput.style.width = "95px"
    clickSizeInput.value = leftClickSize;
    clickSizeInput.onclick = (()=>{
        continousTrade = false;
    })
    clickSizeInput.addEventListener("keypress", (e)=>{
        if (e.key === 'Enter'){
            if (isFinite(clickSizeInput.value)){
                leftClickSize = parseInt(clickSizeInput.value);
            } else {
                alert("Please enter a valid number...")
            }
            continousTrade = true;
        }
    })
    userConsole.appendChild(clickSizeInput)

    let buttonChangeClickSize = document.createElement("button")
    buttonChangeClickSize.innerHTML = "Change Left Click Size"
    buttonChangeClickSize.onclick = (()=>{
        if (isFinite(clickSizeInput.value)){
            leftClickSize = parseInt(clickSizeInput.value);
        } else {
            alert("Please enter a valid number...")
        }
        continousTrade = true;
    })
    userConsole.appendChild(document.createTextNode( '\u00A0\u00A0' ));
    userConsole.appendChild(buttonChangeClickSize)
}

function clickRightSizeSet(){
    let clickSizeInput = document.createElement("input")
    clickSizeInput.type="text";
    clickSizeInput.style.textAlign = "center";
    clickSizeInput.style.width = "95px"
    clickSizeInput.value = rightClickSize;
    clickSizeInput.onclick = (()=>{
        continousTrade = false;
    })
    clickSizeInput.addEventListener("keypress", (e)=>{
        if (e.key === 'Enter'){
            if (isFinite(clickSizeInput.value)){
                rightClickSize = parseInt(clickSizeInput.value);
            } else {
                alert("Please enter a valid number...")
            }
            continousTrade = true;
        }
    })
    userConsole.appendChild(clickSizeInput)


    let buttonChangeClickSize = document.createElement("button")
    buttonChangeClickSize.innerHTML = "Change Right Click Size"
    buttonChangeClickSize.onclick = (()=>{
        if (isFinite(clickSizeInput.value)){
            rightClickSize = parseInt(clickSizeInput.value);
        } else {
            alert("Please enter a valid number...")
        }
        continousTrade = true;
    })
    userConsole.appendChild(document.createTextNode( '\u00A0\u00A0' ));
    userConsole.appendChild(buttonChangeClickSize)
}

function updateUserConsole(){
    removeAllElements(userConsole);
    userConsole.style.position = "fixed";
    userConsole.style.marginLeft = "60px"
    userConsole.style.top = "150px";
    userConsole.style.border = "1px solid black";
    userConsole.style.padding = "30px"
    let cashInform = document.createElement("p");
    cashInform.innerHTML = "Cash: " +  Math.round(player.cash*100) / 100+ " TL";
    userConsole.appendChild(cashInform)
    let stockInform = document.createElement("p");
    stockInform.innerHTML = "Position: " + player.position;
    userConsole.appendChild(stockInform)
    let netPositionInform = document.createElement("p");
    netPositionInform.innerHTML = "Net Position: " + player.netPosition;
    userConsole.appendChild(netPositionInform)
    let pnlInform = document.createElement("p");
    pnlInform.innerHTML = "Day PNL: " +  Math.round(player.dayPnl*100) / 100 + " TL";
    userConsole.appendChild(pnlInform)
    let selfTrade = document.createElement("p");
    selfTrade.innerHTML = "Total Self Trade Amount: " + Math.round(player.selfTrade*100) / 100 + " TL";
    userConsole.appendChild(selfTrade)
    clickLeftSizeSet()
    insertNewLine(userConsole, 2);
    clickRightSizeSet()
}

function insertLogText(id, side, price, lot){
    let textHTML = document.createElement("p");
    if (side === "Buy"){
        textHTML.innerHTML = id + " buys " +lot.toString() + " lots from " + price.toString()  +" at " + (new Date()).toLocaleTimeString() ;
    }
    if (side === "Sell"){
        textHTML.innerHTML = id + " sells " + lot.toString() + " lots at " + price.toString() +" at " + (new Date()).toLocaleTimeString()  ;
    }
    try {
        publicTrades.removeChild(publicTrades.childNodes[20]);
    }
    catch (e){

    }
    publicTrades.insertBefore(textHTML, publicTrades.childNodes[0]);

}

function tradingSession(){
        setInterval(() => {
            if (continousTrade){
                let index = Math.round(Math.random() * traders.length - 1);
                try {
                    traders[index].execute();
                } catch (e){
                    console.log(e);
                }
            }
        }, 125)
}



let player = new Player();
let priceLevels = []
let traders = [];
let publicTrades = document.createElement("div");
body.appendChild(publicTrades);
publicTrades.style.position = "fixed"
publicTrades.style.marginLeft = "875px";
publicTrades.style.marginTop = "150px";
publicTrades.style.border ="1px solid"

createOrderBook();
updateUserConsole()


for (let i=0; i<50; i++){
    let newPrice = new PriceLevel((bestOffer - i*0.01).toFixed(2), i+2);
    priceLevels.push(newPrice);
    newPrice.fillTable()
}

for (let i=0; i<50; i++){
    priceLevels[i].calculateTotalOffer();
    priceLevels[i].calculateTotalBid();
    priceLevels[i].fillTable()
}

for (let i=0 ; i<traderCount; i++){
    traders.push( new Trader(i) );
}

let continousTrade = true;

tradingSession();





