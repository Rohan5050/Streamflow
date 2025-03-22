import * as nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

const message = 'Sign this message to authenticate with Streamflow';

// Generate a new keypair for testing
const keypair = nacl.sign.keyPair();

// Generate signature
const messageBytes = new TextEncoder().encode(message);
const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
const base58Signature = bs58.encode(signature);

// Get the public key
const publicKey = new PublicKey(keypair.publicKey).toString();

console.log('Test Data for Authentication:');
console.log('----------------------------');
console.log('Message:', message);
console.log('Signature (base58):', base58Signature);
console.log('Wallet Address:', publicKey);
console.log('\nUse this data in your Postman request:');
console.log(JSON.stringify({
  signature: base58Signature,
  message: message,
  walletAddress: publicKey
}, null, 2)); 