var DrinkTracker = require('./drinkTracker.js');

var bot;
var minuteInterval;

var shotCounter = 0;

var encouragementArray = ["Fucking champs!", "Hell yea!", "Good shit!", "Keep it up bitches!", "Goddamn that's good shit!", "Solid!", ":100:"]

var _beginPowerHour = function(b, dt) {
    bot = b;
    drinkTracker = dt;
    hopOnAndLockDjBooth();
    beginCountdowns();
}

function hopOnAndLockDjBooth() {
    //Lock and clear booth, add self, skip dj
    bot.moderateLockWaitList(true, true, function(){
        console.log("Locked booth")
        bot.moderateAddDJ(bot.userId, function(){
            console.log("Added myself to waitlist")
            bot.moderateForceSkip(function() {
                console.log("Skipped")
            });
        });
    });
}

function beginCountdowns() {
    bot.sendChat("Congratulations on a month of staying sober. Now welcome to the #JC4L Power Hour!");
    bot.sendChat("Rules: Take a shot of beer when I say to (don't follow the mix). "+
                 "We'll be doing 1 1.5 oz shot of beer per minute for 60 minutes, resulting in a total consumption of 7.5 beers! "+
                 "I'll be keeping track of our progress and BAC");
    bot.sendChat("Commands: !progress, !bac");
    setTimeout(function() {
        takeShot();
        minuteInterval = setInterval(function(){ takeShot() }, 60*1000);
    }, 57*1000);
    
}

var takeShot = function() {
    bot.sendChat("Get ready to drink!");
    bot.sendChat("3...");
    setTimeout(function(){ bot.sendChat("2...")}, 1000);
    setTimeout(function(){ bot.sendChat("1...")}, 2000);
    setTimeout(function(){ 
        bot.sendChat("DRINK!!!");
        updateProgress();
        if(Math.random() < 0.1) {
            setTimeout(function(){ encourageDrinking() }, 1000);
        }
    }, 3000);

}
function updateProgress() {
    ++shotCounter;

    if(shotCounter == 60) {
        endPowerHour();
    }
    else if(shotCounter % 15 == 0 ) {
        _showProgress();
    }

    if(shotCounter % 8 >= 6) {
        sendBeerLowReminder(8 - (shotCounter % 8))
    }
    else if(shotCounter % 8 == 0) {
        sendOpenNewBeerReminder()
    }

    giveEveryoneAShot();
}
function encourageDrinking() {
    bot.sendChat(encouragementArray[Math.floor(Math.random() * encouragementArray.length)]);
}
function giveEveryoneAShot() {
    var usersInRoom = bot.getUsers();
    for(var i=0; i<usersInRoom.length; i++) {
        var username = usersInRoom[i].username;
        if (username == "GhostOfWinstonChurchill") continue;

        DrinkTracker.logDrink(username, "Power Hour Shot", 1.5, 0.045)
    }
}

function sendBeerLowReminder(shotsLeft) {
    var shotsWord = shotsLeft == 1 ? " shot" : " shots";     
    bot.sendChat("I estimate you should only have "+shotsLeft+shotsWord+" left in your current beer! Get ready to get another one!");
}

function sendOpenNewBeerReminder() {
    var beerCount = Math.ceil(shotCounter/8)+1;
    bot.sendChat("Your beer should be empty! Time to start beer "+beerCount+"! :beer:")
}

var _showProgress = function() {
    var percentage = (shotCounter/60 * 100).toFixed(3);
    bot.sendChat("We've taken "+shotCounter+" shots! Only "+(60-shotCounter)+" to go! We're "+percentage+"% through!!!");

    var progressBar = "[";
    for(var i=0; i<35; i++) {
        var p = i/35 * 100;
        progressBar += p < percentage ? "X" : "-";
    }
    progressBar += "]"
    bot.sendChat(progressBar)
}

function endPowerHour() {
    bot.sendChat("That's shot 60!! The power hour is over!! Congrats Jews!! :confetti_ball:")
    bot.sendChat("!compliment @everyone")
    _endPowerHour();

}
var _endPowerHour = function() {
    clearInterval(minuteInterval);
    unlockWaitList();
    bot.moderateRemoveDJ(bot.userId);
}

function unlockWaitList() {
    bot.moderateLockWaitList(false, false);
}



module.exports ={
    begin: _beginPowerHour,
    end: _endPowerHour,
    showProgress: _showProgress,
    increment: takeShot
}