const LocalStrategy = require('passport-local').Strategy;
const Sequelize = require('sequelize');

const models = {}

module.exports.models = models;
const generateHash = require('./utils').generateHash;
const isValidPassword = require('./utils').isValidPassword;
const nundef = require('./utils').nundef;

module.exports.initDb = (config) => {
    const sequelize = new Sequelize({
        dialect: 'mysql',
        host: config['db-host'],
        port: config['db-port'],
        username: config['db-user'],
        password: config['db-pass'],
        database: config['db-name'],
        logging: false
    });
    const user = sequelize.define('user', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        banned: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    })
    const code = sequelize.define('code', {
        code: Sequelize.STRING,
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                key: 'id',
                model: user,
            }
        }
    });
    const loginPlace = sequelize.define('loginPlace', {
        userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            references: {
                key: 'id',
                model: user,
            },
        },
        ipAddress: {
            type: Sequelize.STRING,
            primaryKey: true,
        }
    });

    models['user'] = user;
    models['code'] = code;
    models['loginPlace'] = loginPlace;
    //return sequelize.sync({ force: true });
    return sequelize.sync({ force: false });
}

module.exports.createBouncerAdmin = (sequelize, config) => {
    const tempEmail = config['admin'];
    const tempPassword = config['admin-password'];
    if (nundef(tempEmail) || nundef(tempPassword)) {
        return;
    }
    if (!tempEmail.trim() || !tempPassword.trim()) {
        return;
    }
    const email = tempEmail.trim();
    const password = tempPassword.trim();

    models.user.findOne({
        where: { email: email }
    }).then(user => {
        if (!user) {
            models.user.create({
                email: email,
                password: generateHash(password),
                isAdmin: true
            }).then(_ => console.log('bouncer admin created'));
        } else {
            const userVal = user.get();
            if (isValidPassword(userVal.password, password)) {
                console.log('bouncer admin password was unchanged');
                return;
            }
            userVal.password = generateHash(password);
            models.user.update(userVal, { where: { id: userVal.id } }).then(_ => console.log('bouncer admin password updated'));
        }
    })
}