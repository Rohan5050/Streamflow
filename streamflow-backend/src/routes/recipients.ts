import express, { Request, Response } from 'express';
import { z } from 'zod';
import Recipient from '../models/Recipient';

const router = express.Router();

// Validation schema
const RecipientSchema = z.object({
  name: z.string().min(1),
  walletAddress: z.string().min(32).max(44),
  email: z.string().email().optional(),
  metadata: z.record(z.any()).optional()
});

// Get all recipients
router.get('/', async (req: Request, res: Response) => {
  try {
    const recipients = await Recipient.find();
    res.json(recipients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipients' });
  }
});

// Get single recipient
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    res.json(recipient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipient' });
  }
});

// Create recipient
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = RecipientSchema.parse(req.body);
    const recipient = new Recipient(validatedData);
    await recipient.save();
    res.status(201).json(recipient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating recipient' });
    }
  }
});

// Update recipient
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = RecipientSchema.partial().parse(req.body);
    const recipient = await Recipient.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    res.json(recipient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating recipient' });
    }
  }
});

// Delete recipient
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const recipient = await Recipient.findByIdAndDelete(req.params.id);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    res.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipient' });
  }
});

export default router; 