var user_drinking_info={};

var drink_presets = {
    "beer": {"volume":12, "alcPercentage": 5},
    "light beer": {"volume":12, "alcPercentage":4},
    "wine": {"volume":5, "alcPercentage": 12},
    "whiskey": {"volume": 1.5, "alcPercentage": 40},
    "miller lite": {"volume":12, "alcPercentage":4.4},
    "tullamore": {"volume":1.5, "alcPercentage":40},
    "yuengling": {"volume":12, "alcPercentage":4.4},
    "b&t": {"volume":12, "alcPercentage":4.7},
    "coors": {"voume":0, "alcPercentage":0}
}


var _initDrinking = function(username) {
    console.log(username+" initted at "+Date.now());
    var new_user_info = {
        "arrivalTime": Date.now(),
        "drinkHistory": []
    }
    user_drinking_info[username] = new_user_info;
    
}

var _logDrink = function(username, drinkName, volume, alcPercentage) {
    console.log(username+" drank "+drinkName+" "+volume+"oz "+alcPercentage+"alcPercentage")
    user_drinking_info[username].drinkHistory.push({
        "drinkName": drinkName,
        "volume": volume,
        "alcPercentage": alcPercentage,
        "alc": volume*alcPercentage,
        "standardDrinks": (volume*alcPercentage)/0.6,
        "drinkTime": Date.now()
    });
}
var _calculateBAC = function(username) {

    var bodyWeight = 160;
    var genderConstant = 0.68;
    var drinkHistory = user_drinking_info[username].drinkHistory;
    var totalAlc = 0;
    for(var i = 0; i<drinkHistory.length; ++i){
        totalAlc += drinkHistory[i].alc;
    }
    var gravOfBlood = totalAlc * 5.14;
    var bac = gravOfBlood / (bodyWeight * 0.73);

    var hoursElapsed = (Date.now() - user_drinking_info[username].arrivalTime)/(1000*60*60);
    bac -= hoursElapsed*.015;

    bac = bac < 0.0001 ? 0 : bac;
    return bac.toFixed(3);

}

var _getDrinkInfoForUser = function(username) {
    return user_drinking_info[username].drinkHistory;
}




module.exports = {
  initDrinking: _initDrinking,
  logDrink: _logDrink,
  calculateBAC: _calculateBAC,
  getDrinkInfoForUser: _getDrinkInfoForUser
};