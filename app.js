// Safely initialize Telegram Web App
var tg = null;
try {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
    }
} catch (e) {
    console.log("Not running inside Telegram");
}

// Define tiers at the very top using var
var betTiers = {
    10:  { cost: 20,   lose: 10,   win: 100,   icon: "🪙 Gold Coin" },
    100: { cost: 200,  lose: 10,   win: 2990,  icon: "💍 Ring", bonusEligible: true },
    1000:{ cost: 2000, lose: 200,  win: 99990, icon: "🐉 Water Dragon", bonusEligible: true }
};

var tokens = 500;
var winChance = 0.40;

function playTier(betAmount) {
    var tier = betTiers[betAmount];
    
    if (!tier || tokens < tier.cost) {
        if (tg && typeof tg.showAlert === 'function') {
            tg.showAlert("Not enough tokens to cover this cost!");
        } else {
            alert("Not enough tokens to cover this cost!");
        }
        return;
    }

    tokens -= tier.cost;

    var isWin = Math.random() <= winChance;
    var finalPayout = 0;
    var multiplier = 1;

    if (isWin) {
        finalPayout = tier.win;

        if (tier.bonusEligible) {
            var bonusRoll = Math.random() * 100;
            if (bonusRoll <= 5) {
                multiplier = 5; 
            } else if (bonusRoll <= 20) {
                multiplier = 2; 
            }
            finalPayout *= multiplier;
        }
        
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('heavy');
        }
    } else {
        finalPayout = tier.lose; 
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('light');
        }
    }

    tokens += finalPayout;
    
    document.getElementById("balance").innerText = tokens;
    var outcomeText = document.getElementById("outcome-text");
    
    if (isWin) {
        outcomeText.innerHTML = "🎉 Won <b>" + finalPayout + "</b> tokens!<br>Reward: " + tier.icon + (multiplier > 1 ? " (x" + multiplier + " Bonus!)" : "");
    } else {
        outcomeText.innerHTML = "❌ Lost. Received rebate: " + tier.lose;
    }
}