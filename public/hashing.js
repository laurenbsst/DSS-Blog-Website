/*Javascript file for hashing and salting functions.
Developed by Dovydas
Last updated 10/05/2023*/

var crypto = require("crypto");

export function generateSalt() 
{
    return crypto.randomBytes(16).toString("hex");
}

export function encryptPassword(plainText, salt)
{
    return crypto.pbkdf2Sync(plainText, salt, 1000, 64, 
        "sha512").toString("hex");
}

export function verifyPassword(enteredPassword, storedPassword, storedSalt)
{
    return enteredPassword(encryptPassword(enteredPassword, storedSalt) === storedPassword);
}