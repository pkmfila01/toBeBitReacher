// Settings
var baseBet = 8;// In bits
var baseMultiplier = 1.2; // Target multiplier: 1.13 recommended
var variableBase = false; // Enable variable mode (very experimental), read streakSecurity.
var streakSecurity = 6; // Number of loss-streak you wanna be safe for. Increasing this massively reduces the variableBase calculated. (1-loss = 20%, 2-loss = 5%, 3-loss = 1.25% of your maximum balance). Recommended: 2+
var maximumBet = 10000; // Maximum bet the bot will do (in bits).
var nextMulti = 1.25;
var nextBetMulti = 5.5;

// Variables - Do not touch!
var baseSatoshi = baseBet * 100; // Calculated
var curBet = baseSatoshi;
var currentMultiplier = baseMultiplier;
var currentGameID = -1;
var firstGame = true;
var lossStreak = 0;
var coolingDown = false;
var cashAt = 0;
var cashAt2 = 0;
var lastBet = 0;

// Initialization
// console.log('====== Procon\'s BustaBit Bot ======');
console.log('My username is: ' + engine.getUsername());
console.log('Starting balance: ' + (engine.getBalance() / 100).toFixed(2) + ' bits');
var startingBalance = engine.getBalance();

if (variableBase) {
    console.warn('[WARN] Variable mode is enabled and not fully tested. Bot is resillient to ' + streakSecurity + '-loss streaks.');
}

// On a game starting, place the bet.
engine.on('game_starting', function(info) {
    console.log('====== New Game ======');
    console.log('[Bot] Game #' + info.game_id);
    currentGameID = info.game_id;

	if( engine.lastGamePlay() == 'WON' ){
		lossStreak = 0;
		lastBet = 0;
	}

	if(lossStreak > 1 && (cashAt < 1.8|| cashAt2 < 1.8)){
		lastBet = curBet;
		console.log('[DEBUB] myCooling ');
		return;
	}

    if (coolingDown) {
        if (lossStreak == 0) {
            coolingDown = false;
        } else {
            lossStreak--;
            console.log('[Bot] Cooling down! Games remaining: ' + lossStreak);
            return;
        }
    }

    if (!firstGame) { // Display data only after first game played.
        console.log('[Stats] Session profit: ' + ((engine.getBalance() - startingBalance) / 100).toFixed(2) + ' bits');
        console.log('[Stats] Profit percentage: ' + (((engine.getBalance() / startingBalance) - 1) * 100).toFixed(2) + '%');
    }

    console.log('[DEBUB] lossSteak: ' + lossStreak);

    if ( lastBet > 0 || (engine.lastGamePlay() == 'LOST' &&  !firstGame)) { // If last game loss:
        lossStreak++;
        var totalLosses = 0; // Total satoshi lost.
        var lastLoss = curBet; // Store our last bet.
        if (lossStreak > streakSecurity ) { // If we're on a loss streak, wait a few games!
            coolingDown = true;
            return;
        }
//
		if(lastBet > 0 ){
			curBet = getMulti(lastBet, nextBetMulti); // Then multiply base bet by 4!
		}
		else{
			curBet = getMulti(curBet, nextBetMulti); // Then multiply base bet by 4!
		}
        currentMultiplier = nextMulti;
    } else { // Otherwise if win or first game:
		lastBet = 0;
		if(lossStreak > 0 ){
			lossStreak--;
		}

        // Update bet.
        curBet = baseSatoshi; // in Satoshi
        currentMultiplier = baseMultiplier;
    }

    // Message and set first game to false to be sure.
    console.log('[Bot] Betting ' + (curBet / 100) + ' bits, cashing out at ' + currentMultiplier + 'x');
    firstGame = false;

    if (curBet <= engine.getBalance()) { // Ensure we have enough to bet
        if (curBet > (maximumBet * 100)) { // Ensure you only bet the maximum.
            console.warn('[Warn] Bet size exceeds maximum bet, lowering bet to ' + (maximumBet * 100) + ' bits');
            curBet = maximumBet;
        }
        engine.placeBet(curBet, Math.round(currentMultiplier * 100), false);
    } else { // Otherwise insufficent funds...
        if (engine.getBalance() < 100) {
            console.error('[Bot] Insufficent funds to do anything... stopping');
            engine.stop();
        } else {
            console.warn('[Bot] Insufficent funds to bet ' + (curBet / 100) + ' bits.');
            console.warn('[Bot] Resetting to 1 bit basebet');
            baseBet = 1;
            baseSatoshi = 100;
        }
    }
});

engine.on('game_started', function(data) {
    if (!firstGame) {
        console.log('[Bot] Game #' + currentGameID + ' has started!');
    }
});

engine.on('cashed_out', function(data) {
    if (data.username == engine.getUsername()) {
        console.log('[Bot] Successfully cashed out at ' + (data.stopped_at / 100) + 'x');
    }
});

engine.on('game_crash', function(data) {
	cashAt2 = cashAt;
	cashAt = (data.game_crash / 100);
    if (!firstGame) {
        console.log('[Bot] Game crashed at ' + (data.game_crash / 100) + 'x');
    }
});

function getMulti(cur, ratio){
	return Math.round((cur * ratio)/100)*100;
}
