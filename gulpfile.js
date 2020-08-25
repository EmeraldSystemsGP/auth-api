const { exit } = require("process");

function defaultTask(cb) {
    const express = require("express");
    const app = express();
    const fs = require("fs");
    const http = require("http");
    const https = require("https");
    const hsts = require("hsts");
    const fetch = require("node-fetch");
    /* const paypal = require("paypal-rest-sdk");
    const jwt = require("jsonwebtoken");

    var clientId = "";
    var secret = "";

    paypal.configure({
    "mode": "sandbox",
    "client_id": clientId,
    "client_secret": secret
    });

    var webhooks = {
        "url": "",
        "event_types": [{
            "name": "PAYMENT.SALE.COMPLETED"
        },{
            "name": "PAYMENT.SALE.DENIED"
        }
    ]};

    paypal.notification.webhook.create(webhooks, function (err, webhook) {
        if (err) {
            console.log(err.response);
            throw error;
        } else {
            console.log("Create webhook Response");
            console.log(webhook);
        }
    }); */

    const discord = require("discord.js");
    const bot = new discord.Client({disableEveryone: true});

    //var certificate = fs.readFileSync(__dirname + "/ssl/cert1.pem");
    //var priv = fs.readFileSync(__dirname + "/ssl/privkey1.pem");
    //var auth = fs.readFileSync(__dirname + "/ssl/chain1.pem");

    var httpServer = http.createServer(app);
    /* var httpsServer = https.createServer({
    key: priv,
    cert: certificate,
    ca: auth
    }, app); */

    /* app.use(hsts({
    maxAge: 15552000
    })); */

    app.use(express.json())
    app.set("view engine", "ejs")

    httpServer.listen(8080, function() {
    console.log("Listening on port 8080");
    exit(0);
    });

    /* httpsServer.listen(443, function() {
    console.log("Listening on port 443");
    }); */

    bot.on("ready", () => {

    });

    bot.on("message", async (message) => {
    if (message.content === ">pay" && message.channel.type === "dm") {
    const body = {
    "intent": "CAPTURE",
    "purchase_units": [
        {
        "description": "Acidity Serverside",
        "amount": {
            "currency_code": "CAD",
            "value": "5.00"
        }
        }
    ]
    };

    fetch("https://api.paypal.com/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "Authorization": "" }
    })
    .then(res2 => res2.json())
    .then(json => {
    const err_embed = new discord.MessageEmbed()
    .setAuthor("Acidity Payments")
    .setDescription(`Error occurred with creating a new order, ${message.author}. The developer might have to update the details in PayPal.`)
    .setColor("RANDOM")
    .setTimestamp()
    if (json.error) return message.author.send(err_embed);
    const embed = new discord.MessageEmbed()
    .setAuthor("Acidity Payments")
    .setDescription(`Your order has been created, ${message.author}. ${json.links[1].href}`)
    .setColor("RANDOM")
    .setTimestamp()
    message.author.send(embed);
    });
    }
    });

    app.get("/", function (req, res) {
    if (!req.secure) return res.redirect("https://" + req.hostname);
    res.json({
    status: "ok",
    api_info: "This API is meant to be used with Discord account authorization."
    });
    });

    app.get("/v1/oauth2_redirect", function (req, res) {
    console.log(`[OAUTH2] The access code for IP ${req.ip} is ${req.query.code}.`);

    const data = {
        client_id: "",
        client_secret: "",
        grant_type: "authorization_code",
        redirect_uri: "https://" + req.hostname + "/v1/oauth2_redirect",
        code: req.query.code,
        scope: "identify"
    };

    fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams(data),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    })
    .then(res2 => res2.json())
    .then(info => fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `${info.token_type} ${info.access_token}`,
        },
    }))
    .then(res3 => res3.json())
    .then(info => {
    if (!info.username && req.query.error) return res.status(400).json({status: "err", message: req.query.error_description});
    if (!info.username) return res.status(400).json({status: "err"});
    /* res.json({
    status: "ok",
    username: info.username,
    discriminator: info.discriminator
    }) */
    var role = bot.guilds.cache.get("guildid").roles.cache.find(r => r.name === "Verified");
    var member = bot.guilds.cache.get("guildid").members.cache.get(info.id);
    var role_exists = member.roles.cache.find(r => r.name === "Verified");
    if (role_exists) return res.status(400).json({status: "already_verified"});
    member.roles.add(role);
    res.json({
    status: "verified"
    });
    const embed = new discord.MessageEmbed()
    .setAuthor("Acidity Verification")
    .setDescription(`Verification successful, ${member}.`)
    .setColor("RANDOM")
    .setTimestamp()
    member.send(embed);

    const embed2 = new discord.MessageEmbed()
    .setAuthor(member.user.tag, member.user.avatarURL())
    .setDescription("Verification successful")
    .addField("Member Created At", member.user.createdAt)
    .setColor("RANDOM")
    .setTimestamp()
    bot.channels.cache.get("channelid").send(embed2);
    });
    });

    app.get("/v1/oauth2_redirect_wl", function (req, res) {
        console.log(`[OAUTH2] The access code for IP ${req.ip} is ${req.query.code}.`);

        const data = {
            client_id: "",
            client_secret: "",
            grant_type: "authorization_code",
            redirect_uri: "https://" + req.hostname + "/v1/oauth2_redirect_wl",
            code: req.query.code,
            scope: "identify"
        };

        fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: new URLSearchParams(data),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then(res2 => res2.json())
        .then(info => fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `${info.token_type} ${info.access_token}`,
            },
        }))
        .then(res3 => res3.json())
        .then(info => {
            if (!info.username && req.query.error) return res.status(400).json({status: "err", message: req.query.error_description});
            if (!info.username) return res.status(400).json({status: "err"});
            fetch(`https://api-v2.emeraldsys.xyz/v1/users/discordget?discord=${info.id}`, {
                method: "GET"
            })
            .then(res4 => res4.json())
            .then(info2 => {
                if (info2.status === "ok") {
                    var role = bot.guilds.cache.get("guildid").roles.cache.find(r => r.name === "Whitelisted");
                    var member = bot.guilds.cache.get("guildid").members.cache.get(info.id);

                    var role_exists = member.roles.cache.find(r => r.name === "Whitelisted");
                    if (role_exists) return res.status(401).json({status: "already_whitelisted"});
                    member.roles.add(role);
                    res.json({
                        status: "whitelisted"
                    });
                    const embed = new discord.MessageEmbed()
                    .setAuthor("Acidity Verification")
                    .setDescription(`Whitelist successful, ${member}.`)
                    .setColor("RANDOM")
                    .setTimestamp()
                    member.send(embed);
                } else {
                    var member = bot.guilds.cache.get("guildid").members.cache.get(info.id);
            
            res.status(401).json({
                        status: "not_authorized"
                    });
                    const embed = new discord.MessageEmbed()
                    .setAuthor("Acidity Verification")
                    .setDescription(`Whitelist unsuccessful, ${member}. You are not in the database.`)
                    .setColor("RANDOM")
                    .setTimestamp()
                    member.send(embed);
                }
            })
        });
    });

    app.post("/v1/payments/paypal_webhook", function (req, res) {
    console.log(req.body);
    const embed = new discord.MessageEmbed()
    .setAuthor("[TEST] Acidity Payments Log via PayPal", "")
    .addField("id", req.body.id)
    .addField("type", req.body.event_type)
    .addField("summary", req.body.summary)
    .addField("update_time", req.body.resource.update_time)
    if (req.body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    embed.addField("net_amount", req.body.resource.amount.value + "$ " + req.body.resource.amount.currency_code)
    }
    embed.setColor("RANDOM")
    embed.setTimestamp()
    bot.channels.cache.get("channelid").send(embed);
    res.status(200).end();
    });

    app.get("/v1/payments/payment_method_paypal", function (req, res) {
    res.render("pay.ejs");
    });

    app.get("/v1/github/callback", function (req, res) {
    if (!req.query.code || !req.query.state) return res.status(400).json({status: "bad_req"});

    fetch(`https://github.com/login/oauth/access_token`, {
    method: "POST",
    headers: {
        "Accept": "application/json",
    },
    })
    .then(res2 => res2.json())
    .then(json => {
    if (json.access_token) {
    fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
        "Authorization": `token ${json.access_token}`,
    },
    })
    .then(res3 => res3.json())
    .then(json2 => {
    res.json({
    status: "ok",
    message: "You are logged in as " + json2.login
    });
    })
    }
    })
    });

    app.get("/v1/login", function (req, res) {
    res.render("login.ejs");
    });

    app.post("/v1/login", function (req, res) {
    // to be worked on
    });

    app.get("*", function (req, res) {
    res.status(404).json({
    status: "not_found"
    });
    });

    bot.login("");

    cb();
}

exports.default = defaultTask;