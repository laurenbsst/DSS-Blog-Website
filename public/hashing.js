/*Javascript file for hashing and salting functions.
Developed by Dovydas
Last updated 10/05/2023*/

var crypto = require("crypto");

function generateSalt() 
{
    return crypto.randomBytes(16).toString("hex");
}

function encryptPassword(plainText, salt)
{
    plainText = plainText.concat("f85d0ff9");
    return crypto.pbkdf2Sync(plainText, salt, 1000, 64, 
        "sha512").toString("hex");
}

function verifyPassword(enteredPassword, storedPassword, storedSalt)
{
    return enteredPassword(encryptPassword(enteredPassword, storedSalt) === storedPassword);
}

module.exports = {generateSalt, encryptPassword, verifyPassword}