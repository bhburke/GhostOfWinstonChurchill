var PlugAPI = require('plugapi');
var DrinkTracker = require('./drinkTracker.js');
var PowerHour = require('./powerHour.js');
var request = require('request');


/**Making heroku happy **/
var http = require('http');
var server = http.createServer(function(request, response) { //'connection' listener
  console.log('client connected');
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Greetings from the Ghost of Winston Churchill!');
});
server.listen(process.env.PORT || 8000, function() { //'listening' listener
  console.log('server bound');
});

var ROOM = 'jc4l'
var EMAIL = 'junkyard0001@aol.com'
var PASSWORD = 'jewcrewforlife'
var BOT_USERNAME = 'GhostOfWinstonChurchill'
var BOT_USER_ID = '6186643'

var BOT_REFRESH_URL = 'http://bbfresh.com/summon/'

var BIG_UPS_IMAGE_URLS =  ['http://i.imgur.com/EZTfraw.jpg', 'http://i.imgur.com/khQoeOm.jpg', 'http://i.imgur.com/2aN0Xrq.jpg', 
                            'http://i.imgur.com/QNMiqyS.jpg', 'http://i.imgur.com/MfmHOYb.gif'];
    
var SHOTS_FIRED_URLS = ['http://i.imgur.com/hYad5tP.jpg', 'http://i.imgur.com/lGUZpWR.jpg', 'http://i.imgur.com/rfkY7.gif', 
                            'http://i.imgur.com/EAt5kzd.jpg'];

var JAM_ALERT_IMAGE_URLS = ['http://i.imgur.com/qlBqNCA.gif']

var complimentArray=["you rule!", "keep killing it!", "you're a real good Jew!",
                            "I'd marry you if I was still alive! :heart_eyes:", "I served England because of good people like you!",
                            "you have good hair!", "you make me glad I helped end the Holocaust!",
                            "you're a true OG!", "your plug.dj plays are awesome, and everyone knows it!",
                            "I'm proud to bot for you!", "you deserve the best!", "you're my best friend! :blush:",
                            "this ghost can't deny your charm and grace!", "your friends treasure you! ",
                            "you'd be a fantastic partner for group projects!", "you've got style! :sunglasses:",
                            "I have a crush on you! :kissing_heart:", "there's no doubt about it, you're a champ! :star2: :trophy: :star2:",
                            "you can drink more beer than anyone I know! :beers: :beers: :beers: ", 
                            "you've got Bulldog swag!", "you're a National Blue Ribbon guy!", "you've got a twinkle in your eye!",
                            "your enemies are wrong!", "I love it when you're here!", "you've got a smile that can light up a room! :smiley:", 
                            "you're very strong! :muscle:", "you're a real catch!", "you're a good driver!", "you are an interesting person!",
                             "you're swell!", "I want to be you!", "nobody has it all figured out. You're doing great!", "I'm proud of you!", 
                             "if you were a dog I'd give you a treat!", "you are cool!", "I'm glad you're alive!", "I'm long on your value!", 
                             "if you were a stock I'd invest!" ]

var jamAlertMessages = ["Oh shit!! Sit your asses down for this JC4L #JAM right here!!!!", ":sound: :sound: :sound: #JAMALERT :sound: :sound: :sound:",
                            ":ear: What's this I hear? Uh oh, sounds like it's THE MOTHERFUCKING JAM!!!!!", ":raised_hands: God bless you %dj for laying down this #HOT #JAM #JAMALERT",
                            ":boom: Hold on to your nuts, %dj is dropping a #JAM in the JC4L DJ booth!! :boom:"]

var bacSort = function(a,b) { return parseFloat(b.bac) - parseFloat(a.bac) } ;

/**Stock quote vars**/
var STOCK_QUOTE_URL = "http://dev.markitondemand.com/Api/v2/Quote/json"
var GET_CHART_DATA_URL = "http://dev.markitondemand.com/Api/v2/InteractiveChart/json"
var GENERATE_CHART_URL = "https://chart.googleapis.com/chart"
 
/** Connecting bot **/
var bot = new PlugAPI({
    "email": EMAIL,
    "password": PASSWORD
});
bot.multiLine = true;
bot.connect(ROOM);
bot.userId = BOT_USER_ID;


/**Always reconnect**/
var reconnect = function() { bot.connect(ROOM); };
bot.on('close', reconnect);
bot.on('error', reconnect);

/**Refresh self timeout**/
var refreshBotTimeout = function() { request.post(BOT_REFRESH_URL) };
bot.on('chat', refreshBotTimeout);

/**Autowoot**/
var woot = function() { bot.woot() };
bot.on('roomJoin', woot);
bot.on('advance', woot);

/** Say hi **/
function sayHi(username) {
    bot.sendChat("Yo "+username+"! #JC4L")
}

function getBacOfEveryone() {
    var usersInRoom = bot.getUsers();
    var usersBac = [];
    for(var i=0; i<usersInRoom.length; i++) {
        var username = usersInRoom[i].username;
        if (username == BOT_USERNAME) continue;

        var userBac = DrinkTracker.calculateBAC(username);
        usersBac.push({
            "username": username,
            "bac": userBac
        });
    }
    return usersBac;
}

/** Chat Commands **/
function get_command(message) {

    var command_re = /^!(\w+\b)/;
    var command = command_re.exec(message);

    if(command !== null) {
        return command[1];
    }
}

function getCommandParams(message) {
    var split = message.split(" ");
    split.shift();
    return split;
}

function getUsername(data) {
    var split = data.message.split(" ");
    split.shift();
    if(split.length > 0) {
        return split[0];
    }
    return "@"+data.from.username;
}

function giveCompliment(username) {
    var compliment = getCompliment();
    bot.sendChat(username+", "+compliment);
}

function fireShots(data) {
    var commandParams = getCommandParams(data.message);
    var target = commandParams.join(" ");
    var fromUsername = data.from.username;
    var preposition = target.length > 0 ? " at " : "";
    bot.sendChat("@"+fromUsername+" is FIRING SHOTS"+preposition+target+"!!!! :gun: :gun: :gun: :gun:");
    bot.sendChat(getShotsFiredImage());
}

function giveBigUps(data) {
    var commandParams = getCommandParams(data.message);
    var target = commandParams.join(" ");
    var fromUsername = data.from.username;
    var preposition = target.length > 0 ? " to " : "";
    bot.sendChat("@"+fromUsername+"  gave BIG UPS"+preposition+target+"!!!! :arrow_up: :arrow_up: :arrow_up: :arrow_up: ");
    bot.sendChat(getBigUpsImage());
}

function goHamOnGrab(curator_username) {
    bot.sendChat("Oh shit!!! This Jew @"+curator_username+"just GRABBED this :fire: track!!!!!");
    var dj_username = bot.getDJ().username;
    bot.sendChat("Big ups to our man on the booth @"+dj_username+"!!!");
}

function announceJamAlert() {
    var dj_username = bot.getDJ().username;
    bot.sendChat(getJamAlertImage());
    bot.sendChat(getJamAlertMessage(dj_username));
}

function getBigUpsImage() {
    return getRandomElement(BIG_UPS_IMAGE_URLS);
}

function getShotsFiredImage() {
    return getRandomElement(SHOTS_FIRED_URLS);
}

function getJamAlertImage() {
    return getRandomElement(JAM_ALERT_IMAGE_URLS);
}

function getCompliment() {
    return getRandomElement(complimentArray);
}

function getJamAlertMessage(dj_username) {
    return getRandomElement(jamAlertMessages).replace("%dj", "@"+dj_username);
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/** Last play **/
function announceLastPlayStats(lastPlay) {
    var last_dj_username = lastPlay.dj.user.username;
    var track_title = lastPlay.media.title;
    var track_artist = lastPlay.media.author;
    var up_count = lastPlay.score.positive;
    var down_count = lastPlay.score.negative;
    var curate_count = lastPlay.score.curates;

    bot.sendChat("/me Last play: "+track_artist+" - "+track_title);
    bot.sendChat("/me "+up_count+":+1: | "+down_count+":-1: | "+curate_count+":pray:")
}

/** Drink Tracking ish **/

function startUserDrinking(username) {
    DrinkTracker.initDrinking(username);
    bot.sendChat("@"+username+" started drinking! I see you homie :beers:");
}

function addDrinkForUser(data) {
    var command_params = getCommandParams(data.message);
    if(command_params.length != 3) {
        bot.sendChat("Sorry, I don't understand that drink!")
        bot.sendChat("To use: !drink DrinkName VolumeInOz AlcPercentage")
    }
    else {
        DrinkTracker.logDrink(data.from.username, command_params[0], parseFloat(command_params[1]), parseFloat(command_params[2])/100);
        bot.sendChat("@"+data.from.username+" drank "+command_params[0]+" ("+command_params[1]+"oz "+command_params[2]+"%)");
    }
}

function getUserBac(username) {
    var bac = DrinkTracker.calculateBAC(username.substring(1));
    var msg = "What a champ!";
    if(bac < 0.08) {
        msg = "#SOFT"
    }
    bot.sendChat("I estimate "+username+"'s BAC to be "+bac+"! "+msg);

}

function displayBacRankings() {
    var userBacMap = getBacOfEveryone();
    var sortedUsers = userBacMap.sort(bacSort);
    var msg = "#1 CHAMP :star2: : @"+sortedUsers[0].username+" "+sortedUsers[0].bac+'\n';
    for(var i=1; i<sortedUsers.length; ++i) {
        msg += (i+1) + ": "+sortedUsers[i].username+" "+sortedUsers[i].bac+'\n';
    }
    bot.sendChat(msg);
}


function showDrinkHistory(username) {
    var drinkHistory = DrinkTracker.getDrinkInfoForUser(username.substring(1));
    if(drinkHistory.length == 0) {
        bot.sendChat(username+" hasn't drank anything yet! :laughing: :laughing: :thumbsdown:");
        return;
    } 

    bot.sendChat("I saw "+username+" drink this:");
    var msg="";
    for(var i=0; i<drinkHistory.length; i++) {
        var drink = drinkHistory[i];
        var drinkDate = new Date(drink.drinkTime);
        var drinkHours = drinkDate.getHours() % 12;
        var drinkMins = drinkDate.getMinutes();
        drinkHours = drinkHours < 10 ? '0'+drinkHours : ""+drinkHours;
        drinkMins = drinkMins < 10 ? '0'+drinkMins : "" + drinkMins;

        msg+="A "+drink.drinkName+" ("+drink.volume+"oz "+drink.alcPercentage+"%) at "+drinkHours+":"+drinkMins+" PDT, ";
    }
    console.log(msg);
    msg = msg.substr(0, msg.length-2);
    bot.sendChat("/me "+msg);
}

/** Power Hour **/
function initPowerHour() {
    PowerHour.begin(bot);
}
function endPowerHour() {
    PowerHour.end();
}
function showPowerHourProgress() {
    PowerHour.showProgress();
}
function takeShot() {
    PowerHour.increment();
}


/** Stocks and graphs **/

function displayStockInfo(data) {
    var params = getCommandParams(data.message);
    var symbol = params[0];
    getStockInfo(symbol);
}

function getStockInfo(symbol) {
    request.post(
        STOCK_QUOTE_URL,
        {
            form: {symbol: symbol},
        },
        function(error, response, body) {
            var stockInfo = JSON.parse(body);
            sendStockInfoChat(stockInfo);
        }
    );
}

function sendStockInfoChat(stockInfo) {
    if(!stockInfo.Name) {
        bot.sendChat("Sorry, didn't recognize a stock with that symbol!");
        return;
    }
    
    bot.sendChat(stockInfo.Name + " (" + stockInfo.Symbol+")");
    bot.sendChat("Market cap: "+(stockInfo.MarketCap/1000000).toFixed(4)+"M");
    bot.sendChat("Last Price: "+stockInfo.LastPrice+" Last change: "+stockInfo.ChangePercent.toFixed(2)+"%"+ (stockInfo.ChangePercent > 0 ? ":arrow_up:" : ":arrow_down:"));
    bot.sendChat("Today's High: "+stockInfo.High+" Low: "+stockInfo.Low+" Open: "+stockInfo.Open);
    bot.sendChat(stockInfo.ChangePercentYTD > 0 ? "#ThatsABuy" : "#OrNah");
}


/** Listeners **/

bot.on('userJoin', function(data){
    sayHi("@"+data.username)
    DrinkTracker.initDrinking(data.username);
});

bot.on('roomJoin', function(data) {
    var usersInRoom = bot.getUsers();
    for(var i=0; i<usersInRoom.length; i++) {
        DrinkTracker.initDrinking(usersInRoom[i].username);
    }
});

bot.on('chat', function(data) {
    var command = get_command(data.message);

    if(command) {

        switch(command.toLowerCase()) {
            case 'hi': sayHi(getUsername(data));
                        break;
            case 'compliment': giveCompliment(getUsername(data));
                        break;
            case 'bigups': giveBigUps(data);
                        break;
            case 'shotsfired': fireShots(data);
                        break;
            case 'jamalert': announceJamAlert();
                        break;
            case 'startdrinking': startUserDrinking(data.from.username);
                        break;
            case 'drink': addDrinkForUser(data);
                        break;
            case 'bac': getUserBac(getUsername(data));
                        break;
            case 'showdrinks': showDrinkHistory(getUsername(data));
                        break;
            case 'rankings': displayBacRankings();
                        break;
            case 'powerhour': initPowerHour();
                        break;
            case 'endpowerhour': endPowerHour();
                        break;
            case 'progress': showPowerHourProgress();
                        break;
            case 'stock' : displayStockInfo(data);
        }

    }   
    
});


bot.on('curateUpdate', function(data) {
    var curator = bot.getUser(data.id);
    goHamOnGrab(curator.username);

});

bot.on('advance', function(data) {
    announceLastPlayStats(data.lastPlay);

    if(Math.random() < 0.2) {
        announceJamAlert();
    }
});