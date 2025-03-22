import express, { Request, Response } from 'express';
import Workflow from '../models/Workflow';
import Recipient from '../models/Recipient';

const router = express.Router();

// Get workflow statistics
router.get('/workflow-stats', async (req: Request, res: Response) => {
  try {
    const stats = await Workflow.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalWorkflows = await Workflow.countDocuments();
    const activeWorkflows = await Workflow.countDocuments({ status: 'active' });
    const pausedWorkflows = await Workflow.countDocuments({ status: 'paused' });

    res.json({
      total: totalWorkflows,
      active: activeWorkflows,
      paused: pausedWorkflows,
      statusBreakdown: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow statistics' });
  }
});

// Get budget statistics
router.get('/budget-stats', async (req: Request, res: Response) => {
  try {
    const stats = await Workflow.aggregate([
      {
        $unwind: '$recipients'
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$recipients.amount' },
          averageAmount: { $avg: '$recipients.amount' },
          recipientCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalBudget: stats[0]?.totalAmount || 0,
      averagePayment: stats[0]?.averageAmount || 0,
      totalRecipients: stats[0]?.recipientCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget statistics' });
  }
});

// Get recipient statistics
router.get('/recipient-stats', async (req: Request, res: Response) => {
  try {
    const totalRecipients = await Recipient.countDocuments();
    const uniqueWallets = await Recipient.distinct('walletAddress').then(wallets => wallets.length);

    res.json({
      totalRecipients,
      uniqueWallets,
      recipientsWithEmail: await Recipient.countDocuments({ email: { $exists: true } })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipient statistics' });
  }
});

export default router; 