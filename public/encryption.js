/*Javascript file for encryption & decryption functions. 
    AES cipher chosen as it is strong enough that the US government uses it for classified information.
    Using the "Crypto-JS" library as the presentation of code is tidier than the AES encryption equivalent of Crypto NodeJS.
Developed by Dovydas
Last updated 16/05/2023*/

//Assigning the library to a variable.
const CryptoJS = require("crypto-js");

//Key used for encryption. When designing the encryption functionality, the initial target for encryption was email; 
    //hence the length of key is chosen as emails can be as long as 320 characters.
const key = "Gx5AxNrDHc2f5PTIZCQV8htHy8smwBByXLFNaOIvV16PK9i5U2g5FXxvFSnHbWYRt6a39kkGFmz2ibnt8dNHmRgPLvMEKdLZ4E6sVoNEiDiocEKVwIKsrB2GB59NwT0DvSgjHdBbenV98O3NUotgno9QTLCJIakwDO9H3wc94PRpz7pEubDiEyUddvQpJd4MKRgoxTjvFUyfs5qF21NlGrLw4D27dCRdj8XCi6us3ktMNFGPVyTGUdAdxrmDuJRI";

//Function to encrypt using the AES.
function encryptData(dataToEncrypt)
{
    return CryptoJS.AES.encrypt(dataToEncrypt, key).toString()
}
//Function that decrypts AES encryption.
function decryptData(dataToDecrypt)
{
    return CryptoJS.AES.decrypt(dataToDecrypt, key).toString(CryptoJS.enc.Utf8)
}
//Both functions stringify the returned value so that it is ready to be used.

module.exports = {encryptData, decryptData}