import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        walletAddress: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; walletAddress: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Validation schema for wallet signature
const WalletSignatureSchema = z.object({
  signature: z.string(),
  message: z.string(),
  walletAddress: z.string()
});

export const validateWalletSignature = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { signature, message, walletAddress } = WalletSignatureSchema.parse(req.body);
    
    // TODO: Implement Solana signature verification
    // This is a placeholder for the actual verification logic
    const isValid = true; // Replace with actual verification
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid wallet signature' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: walletAddress, walletAddress },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error validating wallet signature' });
    }
  }
}; 