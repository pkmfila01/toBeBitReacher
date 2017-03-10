//[WARNING] Use this script at your own risk, nobody is responsible if you lose money on bustabit when you use this bot.

//Settings
var GameMode = 1;                //Default: 5        1 = Martingale, 2 = Paroli, 3 = D’Alembert, 4 = Pluscoup, 5 = Recovery
var MaxProfitMode = false;        //Default: true        If this setting is true, you will always bet ("PercentOfTotal" * your balance), if this setting is false you will just bet your BaseBet.
var PercentOfTotal = 2;        //Default: 0.1        If MaxProfitMode is true, your BaseBet will always be ("PercentOfTotal" * your balance). Default 0.1% of your total balance.
var BaseBet = 3;                //Default: 100        This is the value of your first bet (in bits) when MaxProfitMode is set to false.
var Multiplier = 1.13;            //Default: 1.05        This is the multiplier where the bot will stop (not on GameMode 2 and 3).
var dalembert = 1;                //Default: 1        When you play D'alembert you will raise your bet after a loss or lower your bet after a win with this amount.
var MaxBet = 1000000;            //Default: 1000000    The bot will never bet more than this amount (in bits).
var MaxProfit = 12000;            //Default: 100000    The bot will stop when your total balance is higher that this value (in bits).
var MaxLoss = 30000;            //Default: 25000    You will never lose more than this amount (in bits). If a bet would exceed this amount, the bot stops automatically.
var RandomBreak = 20;            //Default: 0        Before the bot places a bet it generates a random number between 0 and 100, if that number is lower than "RandomBreak" the bot will take a break for 1 game. (This will not happen on a loss streak )

// Don't change anything below this if you don't know what you are doing!
var Username = engine.getUsername();
var StartBalance = engine.getBalance();
var CurrentGameID = -1;
var FirstGame = true;
var CurrentBet = BaseBet;
var CurrentMultiplier = Multiplier;
var d = new Date();
var StartTime = d.getTime();
var LastResult = "WON";
var Break = false;
// Check previous bet
var LastBet = 0;
var LastProfit = 0;
var NewProfit = 0;
// Paroli variable's
var ParoliRound = 1;
var ParoliGame = 1;
var StartBet = BaseBet;
// Pluscoup variable's
var Unit = 1;
var SessionProfit = 0;
var MaxSessionProfit = Multiplier - 1; 
// Recovery variable's
var SessionLost = 0;

// Paroli Confirm dialog to set Multiplier to X2.0.
if(GameMode == 2){
    if (confirm("[BustaBot] Paroli is currently only available with the multiplier set to X2.0") == true) {
       // Do nothing and continue with the script.
       console.log('[BustaBot] Multiplier set to X2.0');
    } else {
        // Canceled Paroli mode, bot stopped.
        console.log('[BustaBot] Canceled paroli mode on multiplier X2.0');
        engine.stop();
    }
}

// D'alambert Confirm dialog to set Multiplier to X2.0.
if(GameMode == 3){
    if (confirm("[BustaBot] D'alambert is currently only available with the multiplier set to X2.0") == true) {
       // Do nothing and continue with the script.
       console.log('[BustaBot] Multiplier set to X2.0');
    } else {
        // Canceled Paroli mode, bot stopped.
        console.log('[BustaBot] Canceled D alambert mode on multiplier X2.0');
        engine.stop();
    }
}

// Welcome message
console.log('[BustaBot] Welcome ' + Username);
console.log('[BustaBot] Your start ballance is: ' + (StartBalance / 100).toFixed(2) + ' bits');

//check if the multiplier is 1 or higher.
if(Multiplier < 1){
    console.log('[BustaBot] Your multiplier must be 1.0 or higher.');
    engine.stop();
}

if(GameMode < 1 || GameMode > 5){
    console.log('[BustaBot] Select a game mode between 1 and 5.');
    engine.stop();
}


// Start of a game.
engine.on('game_starting', function(info) {
    CurrentGameID = info.game_id;
    console.log('---------------------');
    console.log('[BustaBot] Game #' + CurrentGameID + ' started.');
    
    var random = randomNumber(1,100);
    
    if(random < RandomBreak){
        console.log("Taking a break this round.");
        Break = true;
    }
    
    if(Break == false){
    
        if(MaxProfitMode == true){
            BaseBet = Math.round((PercentOfTotal / 100) * (engine.getBalance() / 100).toFixed(2));
        }
        
        if (LastResult == 'LOST' && !FirstGame) { // Check if you lost the last game
            if(GameMode == 1){// Martingale
                NewProfit = LastBet + LastProfit;
                CurrentBet = Math.round((NewProfit / LastProfit) * LastBet);
                CurrentMultiplier = Multiplier;
            }
            
            if(GameMode == 2){// Paroli
                CurrentMultiplier = 2;
                CurrentBet = StartBet;
                console.log('[BustaBot] Paroli Round: ' + ParoliRound + ' Game: ' + ParoliGame);
                ParoliGame++;
            }
            
            if(GameMode == 3){// D’Alembert
                CurrentMultiplier = 2;
                CurrentBet = LastBet + dalembert;
            }
            
            if(GameMode == 4){// Pluscoup
                SessionProfit = SessionProfit - Unit;
                CurrentBet = LastBet;
                CurrentMultiplier = Multiplier;
            }
            
            if(GameMode == 5){// Recovery
                SessionLost = SessionLost + CurrentBet;
                CurrentBet = LastBet * 2;
                CurrentMultiplier = (SessionLost + CurrentBet) / CurrentBet;
            }
        }
        else { // If won last game or first game
        
            if(GameMode == 1){// Martingale
                CurrentBet = BaseBet;
                CurrentMultiplier = Multiplier;
            }
            
            if(GameMode == 2){// Paroli
                CurrentMultiplier = 2;
                if(ParoliGame == 1){
                    StartBet = BaseBet;
                    CurrentBet = StartBet;
                }
                if(ParoliGame == 2){
                    CurrentBet = LastBet * 2;
                }
                if(ParoliGame == 3){
                    CurrentBet = LastBet * 2;
                }
                console.log('[BustaBot] Paroli Round: ' + ParoliRound + ' Game: ' + ParoliGame);
                ParoliGame++;
            }
            
            if(GameMode == 3){// D'alambert
                CurrentMultiplier = 2;
                if(!FirstGame)
                {
                    CurrentBet = LastBet - dalembert;
                }
            }
            
            if(GameMode == 4){// Pluscoup
                CurrentMultiplier = Multiplier;
                if(SessionProfit >= MaxSessionProfit)
                {
                StartBet = BaseBet;
                SessionProfit = 0;
                Unit = 1;
                }
                else
                {
                    Unit ++;
                    while((((Unit * Multiplier) - Unit) + SessionProfit) > MaxSessionProfit){
                        Unit = Unit - 1;
                    }
                }
                if(FirstGame){ Unit = 1; StartBet = BaseBet;}
                if(Unit < 1){
                    Unit = 1;
                    StartBet = BaseBet;
                }
                CurrentBet = Unit * StartBet;    
            }
            
            if(GameMode == 5){// Recovery
            SessionLost = 0;
            CurrentBet = BaseBet;
            CurrentMultiplier = Multiplier;
            }
            
        }
        
        //check if current bet is 0 or negative
        if(CurrentBet < 1){
            CurrentBet = 1;
        }
        
        //Check if a Paroli round is finished and start new round for the next bet.
        if(ParoliGame == 4){
            ParoliGame = 1;
            ParoliRound++;
        }
        
        // First game is set to false.
        FirstGame = false;
        // Changing last result
        LastResult = "LOST";
        if(((engine.getBalance() / 100) - CurrentBet) < ((StartBalance / 100) - MaxLoss)){
            console.log('[BustaBot] This bet would Exceed Your maximum loss, the bot will stop now... ');
            engine.stop();
        }else{
            if (CurrentBet <= engine.getBalance()) { // Check if the balance is high enough to place the bet.
                if (CurrentBet > (MaxBet)) { // Check if the bet is higher than the given maximum bet by the user.
                    console.warn('[BustaBot] Current bet exceeds your maximum bet. Your bet is changed to: ' + (MaxBet) + ' bits');
                    CurrentBet = MaxBet;
                }
                console.log('[BustaBot] Betting ' + (CurrentBet) + ' bits, cashing out at ' + CurrentMultiplier + 'x');
                engine.placeBet(CurrentBet * 100, Math.round(CurrentMultiplier * 100), false);
                LastBet = CurrentBet;
                LastProfit = (CurrentBet * CurrentMultiplier) - CurrentBet;
            }
            else { // Not enough balance to place the bet.
                if (engine.getBalance() < 100) { // Stop the bot if balance is less then 100 bits.
                    console.error('[BustaBot] Your account balance is to low to place a bet.... BustaBot will close now.');
                    engine.stop();
                }
                else { // Changes basebet to 1 if balance is to low to make the current bet.
                    console.warn('[BustaBot] Your balance is to low to bet: ' + (CurrentBet / 100) + ' bits.');
                    BaseBet = 1;
                }
            }
        }
    }
});

engine.on('cashed_out', function(data) {
    if (data.username == engine.getUsername()) {
      console.log('[BustaBot] Successfully cashed out at ' + (data.stopped_at / 100) + 'x');
      SessionProfit = SessionProfit + (Unit * MaxSessionProfit);
      if(((engine.getBalance() - StartBalance) / 100).toFixed(2) > MaxProfit){
        console.log('[BustaBot] Maximum profit reached, bot is shutting down...');
        console.log('[BustaBot] You have made '+((engine.getBalance() - StartBalance) / 100).toFixed(2)+' profit this session.');
        engine.stop();
      }
      LastResult = "WON";
    }
});


engine.on('game_crash', function(data) {
    var newdate = new Date();
    var timeplaying = ((newdate.getTime() - StartTime) / 1000) / 60;
    if(Break == false){
        console.log('[BustaBot] Game crashed at ' + (data.game_crash / 100) + 'x'); 
        console.log('[BustaBot] Session profit: ' + ((engine.getBalance() - StartBalance) / 100).toFixed(2) + ' bits in ' + Math.round(timeplaying) + ' minutes.');
    } else{
        Break = false;
    }
});

function randomNumber(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

