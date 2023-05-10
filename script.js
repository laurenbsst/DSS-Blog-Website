// Encryption using modules and sequelize
//Keeping for notes

/*
module.exports = (sequelize, Sequelize) => 
{
    //User Schema
    const User = sequelize.define("user", 
    {
        //No special characters, only alphanumeric characters allowed.
        username: {
            type: Sequelize.STRING,
            set: function (val) {
                this.setDataValue("username", val.toLowerCase());
            },
            notEmpty: true,
            notNull: true,
            is: /^[a-zA-Z0-0\._]{4,32}$/,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            set: function (val) {
                this.setDataValue("email", val.toLowerCase());
            },
            isEmail: true,
            notEmpty: true,
            notNull: true,
            unique: true
        },
        password: {
            type: Sequelize.STRING,
            notEmpty: true,
            notNull: true,
            get()
            {
                return () => this,getDataValue("password")
            }
        },
        salt: {
            type: Sequelize.STRING,
            notEmpty: true,
            notNull: true,
            get() 
            {
                return () => this.getDataValue("salt")
            }
        }
    });
    //User class methods.
    User.generateSalt = function() 
    {
        return crypto.randomBytes(16).toString("hex");
    }
    User.encryptPassword = function(plainText, salt)
    {
        return crypto.pbkdf2Sync(plainText, salt, 1000, 64, 
            "sha512").toString("hex");
    }
    /*Method that will encrypt user password with new salt when 
        password is updated.*/
    /*const setSaltAndPassword = user => 
    {
        if (user.changed("password"))
        {
            user.salt = User.generateSalt()
            user.password = User.encryptPassword(user.password(), user.salt())
        }
    }

    //User instance method to validate user password.
    User.prototype.verifyPassword = function (enteredPassword) 
    {
        return User.encryptPassword(enteredPassword, this.salt()) ===
        this.password()
    }
    User.beforeCreate(setSaltAndPassword)
    User.beforeUpdate(setSaltAndPassword)
}*/

var crypto = require("crypto");

function generateSalt() 
{
    return crypto.randomBytes(16).toString("hex");
}

function encryptPassword(plainText, salt)
{
    return crypto.pbkdf2Sync(plainText, salt, 1000, 64, 
        "sha512").toString("hex");
}

function verifyPassword(enteredPassword, storedPassword, storedSalt)
{
    return enteredPassword(encryptPassword(enteredPassword, storedSalt) === storedPassword);
}