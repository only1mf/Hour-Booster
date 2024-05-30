const Steam = require("steam-user"),
      fs = require("fs"),
      readlineSync = require("readline-sync"),
      chalk = require("chalk"),
      SteamCommunity = require("steamcommunity"),
      client = new Steam,
      readline = require("readline");

const settings = {
    acceptRandomFriendRequests: false,
    acceptItemNotify: true,
    acceptTradesNotify: true,
    acceptReplys: false,
    limits: 25,
    restriction: 5,
    games_id: []
};

var mobileCode, wstream, version = "v0.9.9";
console.log(chalk.white.bold.bgBlack("    SHB Meta9   "));
console.log(chalk.gray.underline("                   " + version));
console.log(chalk.black.bold.bgWhite("      Steam Login        "));

//values for game IDs, username, and password
var gamesid = "730,1938090,1172470,570,304050,620,440,714010,578080";
var username = "YOUR-LOGIN-USERNAME";
var password = "YOUR-LOGIN-PASSWORD";

var hasTwoFactorCode = readlineSync.keyInYNStrict(chalk.gray.bold(" Do you have a SteamGuard? ") + ": ");
if (hasTwoFactorCode) {
    mobileCode = readlineSync.question(chalk.gray.bold(" SteamGuard ") + ": ", { hideEchoBack: true });
}

var dtiming = new Date,
    tstamp = Math.floor(Date.now() / 1e3),
    CountGamesUsed = function (e) {
        for (var n = e.Length - 1; n > 0; n--) {
            var t = Math.floor(Math.random() * (n + 1)),
                o = e[n];
            e[n] = e[t];
            e[t] = o;
        }
        return e;
    };

function parseInput(e) {
    return e.split(",").map(e => parseInt(e.trim()));
}

function log(e) {
    for (var n = new Date, t = [n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes(), n.getSeconds()], o = 1; o < 6; o++) t[o] < 10 && (t[o] = "0" + t[o]);
    console.log(" " + t[3] + ":" + t[4] + ":" + t[5] + " - \x1b[36m%s\x1b[0m", "[STEAM] " + e);
}

function error(e) {
    for (var n = new Date, t = [n.getFullYear(), n.getMonth() + 1, n.getDate(), n.getHours(), n.getMinutes(), n.getSeconds()], o = 1; o < 6; o++) t[o] < 10 && (t[o] = "0" + t[o]);
    console.log(" " + t[3] + ":" + t[4] + ":" + t[5] + " - \x1b[36m%s\x1b[0m", "[ERROR] " + e);
}

function shutdown(e) {
    log(chalk.red("Connection Lost..."));
    client.logOff();
    client.once("disconnected", function () {
        process.exit(e);
    });
    setTimeout(function () {
        process.exit(e);
    }, 500);
}

client.logOn({ games_id: gamesid, accountName: username, password: password, twoFactorCode: mobileCode });
settings.games_id = parseInput(gamesid);

client.on("loggedOn", function () {
    client.setPersona(Steam.EPersonaState.Away);
    if (username === "" || password === "") {
        console.log(chalk.black.bold.bgWhite("    Connection Status    "));
        log(chalk.red("Login Denied - Empty fields."));
        shutdown();
    } else {
        console.log(chalk.black.bold.bgWhite("    Connection Status    "));
        client.on("accountInfo", function (e, n) {
            log(chalk.green("Logged in as " + e + "."));
            client.on("vacBans", function (e, n) {
                if (e > 0) {
                    log(chalk.red("Verified (" + e + ") ban" + (1 == e ? "" : "s") + "." + (0 == n.length ? "" : " in " + n.join(", "))));
                    log(chalk.red("[BOT] not able to proceed with banned games."));
                    shutdown();
                }
            });
        });
        log(chalk.yellow("Tip: Use (CTRL + C) to Logout."));
        client.gamesPlayed(CountGamesUsed(settings.games_id));
    }
});

if (fs.existsSync("servers")) {
    Steam.servers = JSON.parse(fs.readFileSync("servers"));
    log(chalk.green("Connecting ..."));
}

client.on("connected", function () {
    log(chalk.green("Starting Bot..."));
});

client.on("accountLimitations", function (e, n, t, o) {
    console.log(chalk.black.bold.bgWhite("      Initializing       "));
    if (2 == o) log(chalk.red("[Invite] canInviteFriends Banned."));
    else log(chalk.green("Checking Invite Friends ..."));
    if (n) log(chalk.red("[Community] Community Banned."));
    else log(chalk.green("Checking Community ..."));
    if (t) log(chalk.red("[Account] Locked Account."));
    else log(chalk.green("Checking Account ..."));
    log(chalk.green("Initializing ..."));
    if (e) {
        if (settings.games_id.length < settings.restriction) {
            log(chalk.blue("This Account is Limited."));
            log(chalk.green("[Limited] Currently In-Game " + settings.games_id.length + "."));
        } else {
            error(chalk.red("Exceeded the limit 5 Games..."));
            shutdown();
        }
    } else if (settings.games_id.length < settings.limits) {
        log(chalk.green("Currently In-Game " + settings.games_id + "."));
    } else {
        error(chalk.red("Exceeded the limit 25 Games."));
        shutdown();
    }
});

client.on("friendRelationship", (e, n) => {
    if (2 === n && settings.acceptRandomFriendRequests) {
        client.addFriend(e);
        log(chalk.yellow("You have an invite from " + e + "."));
    } else {
        error(chalk.red("Unable to Accept Requests."));
    }
});

client.on("newItems", function (e) {
    if (settings.acceptItemNotify) {
        if (e > 0) log(chalk.yellow("You received (" + e + ") items in your Inventory."));
    } else {
        error(chalk.red("Unable to Drop."));
    }
});

client.on("tradeOffers", function (e, n) {
    if (settings.acceptTradesNotify) {
        if (e > 0) log(chalk.yellow("You received (" + e + ") Trade Offer from " + n + "."));
    } else {
        error(chalk.red("Unable to Trade."));
    }
});

client.on("friendMessage", function (e, n) {
    log(chalk.yellow("Received a message from " + e.getSteam3RenderedID() + " saying: " + n));
    if (settings.acceptReplys) {
        if (n === "hello") client.chatMessage(e, "Yoo, wait a moment. ;D");
        else if (n === "play") client.chatMessage(e, "Not now... i'm making missions");
        else if (n === "Why") client.chatMessage(e, "Because i'm doing something");
        else if (n === "yo") client.chatMessage(e, "Yoo, wait a moment ;D");
        else if (n === "Do you want to play?") client.chatMessage(e, "Not now");
        else if (n === "Whatsup") client.chatMessage(e, "hey");
        else if (n === "Are you there?") client.chatMessage(e, "Yes, but i'm leaving... bye");
        else if (n === "...") client.chatMessage(e, "Not now!");
        else if (n === "yes") client.chatMessage(e, "Not now!");
    } else {
        error(chalk.red("Unable to Auto-answer."));
    }
});

client.on("error", function (e) {
    console.log(chalk.white.bold.bgRed("    Connection Status    "));
    if (e.eresult == Steam.EResult.InvalidPassword) {
        error(chalk.red("User or Password Wrong."));
        shutdown();
    } else if (e.eresult == Steam.EResult.AlreadyLoggedInElsewhere) {
        error(chalk.red("Already logged in!"));
        shutdown();
    } else if (e.eresult == Steam.EResult.AccountLogonDenied) {
        error(chalk.red("SteamGuard is required!"));
        shutdown();
    }
});

process.on("SIGINT", function () {
    shutdown();
});
