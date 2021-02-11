import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import { default as config } from '../config';

const { ENCRYPTION_IV, ENCRYPTION_KEY } = config;

const algorithm = 'aes-256-cbc';
let key = Buffer.alloc(32);

key = Buffer.concat([Buffer.from(ENCRYPTION_KEY)], key.length);

export const encrypt = (stringToEncrypt: string): string => {
    const cipher = createCipheriv(algorithm, key, ENCRYPTION_IV);
    let encrypted = cipher.update(stringToEncrypt, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

export const decrypt = (stringToDecrypt: string): string => {
    const decipher = createDecipheriv(algorithm, key, ENCRYPTION_IV);
    let decrypted = decipher.update(stringToDecrypt, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export const generateIv = (): string => {
    return randomBytes(8).toString('hex');
};
