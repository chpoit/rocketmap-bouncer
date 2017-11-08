const bCrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * @argument password, string, the password to hash
 * @returns string, the hash
 */
module.exports.generateHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};
/**
 * @argument userpass, string, password hash from the database
 * @argument password, string, the password to check
 * @returns boolean, whether or not the password is the right one.
 */
module.exports.isValidPassword = function(userpass, password) {
    return bCrypt.compareSync(password, userpass);
};

module.exports.nundef = (val) => val === null || val === undefined;

module.exports.randomString = (length) => {
    var result = '';
    for (var i = length; i > 0; --i) {
        const hex = crypto.randomBytes(4).toString('hex');
        const index = parseInt(hex, 16) % chars.length;
        result += chars[index];
    }
    return result;
}