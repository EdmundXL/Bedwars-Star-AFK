const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

const GoalFollow = goals.GoalFollow;
const config = require("./config.json");
const readline = require('readline');
const mineflayer = require('mineflayer');
const { exec } = require('child_process');
const { send } = require('process');


const { performance } = require('perf_hooks');
const { Vec3 } = require('vec3');




const bot = mineflayer.createBot({
    host: `${config.serverIP}`,
    username: `${config.email}`,
    version: `${config.version}`,
    auth: `${config.auth}`,
    port: 25565
});

targetign = config.ign

if (config.afk) {
    afker = "AFK MODE | ON"
}else{
    afker = "AFK MODE | OFF [Party Bot When Ready]"
}



const gameModes = ["bedwars_eight_two", "bedwars_four_four"];

const randomGameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
const playcommand = `/play ${randomGameMode}`;
webhook = config.version

const mcData = require('minecraft-data')(bot.version);

bot.once("login", async () => {
    console.log("Successfully spawned into the host server! (" + config.serverIP + ")");
    sendStuff(`> Logged On ${bot.username} - ${afker}`);

    bot.chat('/l bw')

    if (config.afk) {
        setTimeout(() => {
            bot.chat(playcommand);
        if (randomGameMode === "bedwars_eight_two"){
            moder = "Doubles"
        }else if (randomGameMode === "bedwars_four_four"){
            moder = "Fours"
        }
        sendStuff(`> Queued ${moder}`);
        }, 3000);
        
    }else{
        bot.chat('/swaplobby 18')
        sendStuff("Swapped to Lobby 18");
    }

});


bot.on('title', text => {
    const data = JSON.parse(text)
    if(data.text.includes("VICTORY") || data.text.includes("OVER")) {
        console.log("Detected a game end. Queueing.")
        sendStuff("Gamed Ended");
        if (config.afk) {
            bot.chat(playcommand);
            if (randomGameMode === "bedwars_eight_two"){
                moder = "Doubles"
            }else if (randomGameMode === "bedwars_four_four"){
                moder = "Fours"
            }
            sendStuff(`> Queued ${moder}`);
        }
    }
		if(data.text == "§c1") {
			console.log("Game started.")
            sendStuff("> Game Started");

            bot.setControlState('back', true);
            setTimeout(() => {
                bot.setControlState('back', false);
            }, 3000);
            
		}
        
})



bot.on('message', text => {
    if (text.extra && text.extra.length > 0) {
        const firstExtra = text.extra[0];
        if(text.extra[0].text == "You have been eliminated!") {
            console.log("Bot took a final death. Queueing.")
            sendStuff("> I've Taken a Final Death | Requeuing")
            bot.chat(playcommand)
            }
        if (firstExtra.text && firstExtra.text.startsWith("+25")) {
            console.log("+25 Bed Wars Experience (Time Played)");
        } else if (firstExtra.text === "You will be afk-ed in ") {
            sendStuff("__Anti-AFK Toggled__");
            bot.setControlState('forward', true);

            setTimeout(() => {
                bot.setControlState('forward', false);

                setTimeout(() => {
                    bot.setControlState('back', true);
                    setTimeout(() => {
                        bot.setControlState('back', false);
                    }, 3000);
                }, 3000);
            }, 3000);
        }
    }
    
    if (text.json && text.json.text === "You were spawned in Limbo.") {
        bot.chat(`/l`);
        bot.chat(`/rejoin`);
    } else if (text.json && text.json.text.includes("You have respawned")) {
        bot.setControlState('back', true);
        setTimeout(() => {
            bot.setControlState('back', false);
        }, 3000);
    }
});


bot.on('chat', (username, message) => {
    if(message.includes('join their party')){
        bot.chat(`/p accept ${targetign}`)
    }

    if(message.includes(targetign)){
        bot.chat(`/f accept ${targetign}`)
    }

    if(message.includes('!come')){
        const targetPlayer = message.split(' ')[1];

        const target = bot.players[targetPlayer];
        if (target) {
            const botPosition = bot.entity.position;
            const playerPosition = target.entity.position;
            const distance = botPosition.distanceTo(playerPosition);

            if (distance > 100) {
                bot.chat("Player is too far away.");
                return;
            }

            const movements = new Movements(bot, bot.entity);
            movements.allow1by1towers = false;
            movements.scafoldingBlocks.push(bot.registry.itemsByName.dirt.id);
            movements.allowFreeMotion = true;
            movements.canDig = true;

            bot.pathfinder.setMovements(movements);
            bot.pathfinder.setGoal(new goals.GoalNear(playerPosition.x, playerPosition.y, playerPosition.z, 1));

            console.log(`Following player: ${targetPlayer}`);
        } else {
            bot.chat(`Player ${targetPlayer} not found.`);
        }
    }
    
    if(message.includes('You have respawned!')){
        bot.setControlState('back', true);
        setTimeout(() => {
            bot.setControlState('back', false);
        }, 3000);
    }

    if (username !== bot.username && message.includes('!drop')){
        itemname = message.substring(message.indexOf('drop') + 5).trim();
        const itemToDrop = bot.inventory.items().find(item => item.name.includes(itemname));


        if (itemToDrop) {
            bot.tossStack(itemToDrop);
            sendStuff(`Dropped ${itemToDrop.name}`);
        } else {
            sendStuff(`Can't find item in the inventory sorry :(`);
        }
    }

    if (username !== bot.username && message.includes('!accept')){
        const targetPlayer = message.split(' ')[1];
        bot.chat(`/p accept ${targetPlayer}`);
    }
    if (username !== bot.username && message.includes('!move')) {
        bot.setControlState('back', true);
        setTimeout(() => {
            bot.setControlState('back', false);
        }, 3000);
    }


});


bot.on('messagestr', async (message) => {
    if (message.includes(`${targetign} has invited you to join their party`)) {
      bot.chat(`/p accept ${targetign}`)
    }
});


const sendStuff = (msg) => {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
            content: msg,
            username: `${bot.username}`,
            avatar_url: `https://minotar.net/helm/${bot.username}/600.png`
        })
    })
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error('Error: ' + error);
        });
}
