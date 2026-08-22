// Safely initialize Telegram Web App if available
let tg = null;
if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// Define tiers FIRST
const betTiers = {
    10:  { cost: 20,   lose: 10,   win: 100,   icon: "🪙 Gold Coin" },
    100: { cost: 200,  lose: 10,   win: 2990,  icon: "💍 Ring", bonusEligible: true },
    1000:{ cost: 2000, lose: 200,  win: 99990, icon: "🐉 Water Dragon", bonusEligible: true }
};

let tokens = 500;
const winChance = 0.40; // 40% win rate

function playTier(betAmount) {
    const tier = betTiers[betAmount];
    
    if (!tier || tokens < tier.cost) {
        if (tg && typeof tg.showAlert === 'function') {
            tg.showAlert("Not enough tokens to cover this cost!");
        } else {
            alert("Not enough tokens to cover this cost!");
        }
        return;
    }

    // Deduct cost
    tokens -= tier.cost;

    // Roll RNG
    const isWin = Math.random() <= winChance;
    let finalPayout = 0;
    let multiplier = 1;

    if (isWin) {
        finalPayout = tier.win;

        if (tier.bonusEligible) {
            const bonusRoll = Math.random() * 100;
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
        finalPayout = tier.lose; // Rebate
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('light');
        }
    }

    // Update balance
    tokens += finalPayout;
    
    // Update UI text securely
    document.getElementById("balance").innerText = tokens;
    const outcomeText = document.getElementById("outcome-text");
    
    if (isWin) {
        outcomeText.innerHTML = `🎉 Won <b>${finalPayout}</b> tokens!<br>Reward: ${tier.icon} ${multiplier > 1 ? `(x${multiplier} Bonus!)` : ''}`;
    } else {
        outcomeText.innerHTML = `❌ Lost. Received rebate: ${tier.lose}`;
    }
}