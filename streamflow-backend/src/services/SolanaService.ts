import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { z } from 'zod';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

// Solana network configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Validation schemas
const TransactionSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number().positive(),
  memo: z.string().optional()
});

const SignatureSchema = z.object({
  signature: z.string(),
  message: z.string(),
  walletAddress: z.string()
});

export class SolanaService {
  /**
   * Verifies a wallet signature
   * @param {string} signature - The base58-encoded signature from the wallet
   * @param {string} message - The message that was signed
   * @param {string} walletAddress - The Solana wallet address
   * @returns {Promise<boolean>} - Returns true if the signature is valid
   */
  static async verifySignature(signature: string, message: string, walletAddress: string) {
    try {
      // Convert base58 signature to Uint8Array
      const signatureBytes = bs58.decode(signature);
      
      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);
      
      // Convert wallet address to Uint8Array
      const publicKey = new PublicKey(walletAddress);

      // Verify signature using tweetnacl
      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Creates a new Solana transaction
   * @param {object} data - Transaction data
   * @returns {Promise<Transaction>} - Solana transaction object
   */
  static async createTransaction(data: z.infer<typeof TransactionSchema>) {
    try {
      const validatedData = TransactionSchema.parse(data);
      const fromPubkey = new PublicKey(validatedData.from);
      const toPubkey = new PublicKey(validatedData.to);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: validatedData.amount * LAMPORTS_PER_SOL
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      return transaction;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid transaction data');
      }
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @param {string} walletAddress - The wallet address
   * @returns {Promise<number>} - Balance in SOL
   */
  static async getBalance(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Get transaction history for a wallet
   * @param {string} walletAddress - The wallet address
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<object[]>} - Array of transaction history objects
   */
  static async getTransactionHistory(walletAddress: string, limit = 10) {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get recent signatures
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });

      // Get transaction details
      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const tx = await connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            
            if (!tx) return null;

            return {
              signature: sig.signature,
              timestamp: tx.blockTime,
              slot: sig.slot,
              fee: tx.meta?.fee,
              status: tx.meta?.err ? 'failed' : 'success'
            };
          } catch (error) {
            console.error(`Error fetching transaction ${sig.signature}:`, error);
            return null;
          }
        })
      );

      // Filters out null values and return valid transactions
      return transactions.filter((tx) => tx !== null);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }
}
