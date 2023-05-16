/*Javascript file for hashing and salting functions. Using the PBKDF2 key derivation functions as it offers a highly customizable password hashing algorithm. 
Developed by Dovydas
Last updated 10/05/2023*/

var crypto = require("crypto");

//Function creates a salt that is later used in the hashing algorithm. Salt is necessary to have different hashing outputs with the same user passwords.
function generateSalt() 
{
    return crypto.randomBytes(16).toString("hex");
}

//Hashing algorithm, protects against brute force guessing and dictionary tables like rainbow tables.
function hashPassword(plainText, salt)
{
    //Appending a string ontop of the password also known as peppering.
    plainText = plainText.concat("f85d0ff9");

    //Password Based Key Derivation Function 2: calls a pseudorandom function (HMAC) that uses the SHA512 hashing function to produce the cryptographic key. 
        //Essentially acting as the umbrella function that organises the other functions and formats the plaintext with salt for hashing.
        //Benefits of using the PBKDF2 with SHA512 is that SHA512 is very fast but can be vulnerable to brute force password guessing, 
        //combining all of these elements makes reconstructing or guessing the hash more difficult.
    return crypto.pbkdf2Sync(plainText, salt, 1000, 64, 
        "sha512").toString("hex");
}

//Used to validate user's login.
function verifyPassword(enteredPassword, storedPassword, storedSalt)
{
    return hashPassword(enteredPassword, storedSalt) === storedPassword;
}

module.exports = {generateSalt, hashPassword, verifyPassword}