import express, { Request, Response } from 'express';
import { z } from 'zod';
import Budget from '../models/Budget';

const router = express.Router();

// Validation schema
const BudgetSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  category: z.string().min(1),
  status: z.enum(['active', 'inactive', 'depleted']).default('active'),
  metadata: z.record(z.any()).optional()
});

// Get all budgets
router.get('/', async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budgets' });
  }
});

// Get single budget
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget' });
  }
});

// Create budget
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = BudgetSchema.parse(req.body);
    const budget = new Budget(validatedData);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating budget' });
    }
  }
});

// Update budget
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = BudgetSchema.partial().parse(req.body);
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating budget' });
    }
  }
});

// Delete budget
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting budget' });
  }
});

// Update budget status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = z.object({ status: z.enum(['active', 'inactive', 'depleted']) }).parse(req.body);
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating budget status' });
    }
  }
});

export default router; 