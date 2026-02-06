const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

let KEY;
const getEncryptionKey = () => {
    if (!KEY) {
        if (!env.JWT_SECRET) {
            throw new Error('Encryption failed: JWT_SECRET environment variable is not set');
        }
        KEY = crypto.scryptSync(env.JWT_SECRET, 'salt', 32);
    }
    return KEY;
};


/**
 * Encrypt a string
 * @param {string} text 
 */
exports.encrypt = (text) => {
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt a string
 * @param {string} text 
 */
exports.decrypt = (text) => {
    if (!text || !text.includes(':')) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
