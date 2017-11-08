const path = require('path');
const fs = require('fs');
const nundef = require('./utils').nundef;
const crypto = require('crypto');

module.exports = (configPath) => {
    //We add a .. to take into account that the configLoader JS file is locatied inide the src folder    
    const finalPath = path.normalize(configPath.match(/^\.\//) ?
        path.resolve(path.join('..', configPath)) :
        path.resolve(configPath));
    console.log('final path:', finalPath)
    const configObject = {};

    const file = fs.readFileSync(finalPath, { encoding: 'UTF-8' });
    let lines = file.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        var newLine = cleanseComments(line);
        if (newLine) {
            lines[i] = newLine;
            const [_, name, val] = extractConfigValue(newLine);
            if (!name || !val) {
                continue;
            }
            configObject[name] = val;
        }
    }
    const finalConfig = createFinalConfigObject(configObject);
    return finalConfig;
}

const cleanseComments = (configLine) => {
    return configLine.replace(/\s*\#.*/, '');
}

const extractConfigValue = (configLine) => {
    return configLine.match(/^(\w.*)\:\s+(.*\w)\s*$/) || [null, null, null];
}

const createFinalConfigObject = (configObject) => {
    if (!nundef(configObject['bouncer-port']) &&
        !nundef(configObject['port']) &&
        configObject['bouncer-port'] === configObject['port']) {
        throw new Error('Cannot use the same port for the bouncer and rocketmap.');
    }
    const finalConfig = {
        //to reduce the chance of not writing the config name properly and spending 
        //20 minutes wondering why something is not working, I drop the "bouncer-" 
        //off of all the fields
        'port': configObject['bouncer-port'] || 4800,
        'db-host': configObject['bouncer-db-host'] || configObject['db-host'],
        'db-port': configObject['bouncer-db-port'] || configObject['db-port'] || 3306,
        'db-name': configObject['bouncer-db-name'] || configObject['db-name'],
        'db-user': configObject['bouncer-db-user'] || configObject['db-user'],
        'db-pass': configObject['bouncer-db-pass'] || configObject['db-pass'],
        'target': configObject['bouncer-target'] || 'localhost',
        'target-port': configObject['bouncer-target-port'] || configObject['port'] || 5000,
        'session-secret': configObject['bouncer-session-secret'] || crypto.randomBytes(64).toString('hex'),
        'admin': configObject['bouncer-admin'] || null,
        'admin-password': configObject['bouncer-admin-password'] || null,
        'no-special-code': configObject['bouncer-no-special-code'] || false,
        'locale': configObject['bouncer-locale'] || configObject["locale"] || "en",
    }

    if (
        nundef(finalConfig['db-host']) ||
        nundef(finalConfig['db-name']) ||
        nundef(finalConfig['db-user']) ||
        nundef(finalConfig['db-pass']) ||
        nundef(finalConfig['db-port']) ||
        !finalConfig['port']
    ) {
        throw new Error('Some of the required config fields are not present. Refer to the repo on github to find the required fields.');
    }

    return finalConfig;
}