const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const httpProxy = require('http-proxy');
// const proxy = require('http-proxy-middleware');

const passport = require('passport');
const exphbs = require('express-handlebars')

const configLoader = require('./src/configLoader');
const passportLoader = require('./src/passport');
const dbLoader = require('./src/db');
const controllers = require("./src/controllers")

let configPath = "/RocketMap/config/bouncer-config.ini";
process.argv.forEach((val, index, array) => { if (val === "--config-path") { configPath = array[index + 1]; } });


const config = configLoader(configPath);
dbLoader.initDb(config)
    .then((sequelize) => {
        console.log("sql looks good.")
        dbLoader.createBouncerAdmin(sequelize, config);
        passportLoader.initPassport(passport, sequelize, config);
    });


const apiProxy = httpProxy.createProxyServer({
    target: {
        host: config["target"],
        port: config["target-port"],
    }
});
apiProxy.on('proxyReq', (proxyReq, req, res, options) => {
    if (req.body) {
        let bodyData = JSON.stringify(req.body);
        // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // stream the content
        proxyReq.write(bodyData);
    }
});
apiProxy.on('proxyRes', function(proxyRes, req, res) {
    if (req.url === '/status' || req.url === '/login')
        console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});
apiProxy.on('error', (err, req, res) => {
    console.error(err);
    res.send("Something broke");
});

const baseRedirectUrl = `http://${config['target']}:${config['target-port']}`;
const app = express();
const port = config["port"];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Passport + session crap
app.use(session({
    secret: config["session-secret"],
    cookie: {
        maxAge: 7 * 24 * 60 * 60,
    },
    saveUninitialized: true,
    resave: false,
    rolling: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("./"));

controllers.admin(passport, app);
controllers.auth(passport, app);
controllers.web(baseRedirectUrl, app, apiProxy);


app.use(function(err, req, res, next) {
    console.error(err);
    res.send("Une erreur s'est produite.")
});

app.listen(port,
    () => console.log(`Rocketmap bouncer listening on port ${port}!`)
);
if (!!eval(process.env.ignore || false)) {
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("//////        CURRENTLY IGNORING USERS, ANYONE CAN USE THE MAP         //////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
    console.log("/////////////////////////////////////////////////////////////////////////////")
}