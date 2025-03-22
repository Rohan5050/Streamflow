/*import express, { Request, Response } from 'express';
import { z } from 'zod';
import Workflow from '../models/Workflow';
import { WorkflowService } from '../services/workflow';
import { validateWalletSignature } from '../middleware/auth';

const router = express.Router();

// Validation schemas 
const RecipientSchema = z.object({
  walletAddress: z.string(),
  amount: z.number().positive()
});

const ScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.date()
});

const WorkflowSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['fixed', 'percentage', 'milestone']),
  recipients: z.array(RecipientSchema),
  schedule: ScheduleSchema
});

// Get all workflows
router.get('/', async (req: Request, res: Response) => {
  try {
    const workflows = await Workflow.find();
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows' });
  }
});

// Get single workflow
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow' });
  }
});

// Create workflow
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = WorkflowSchema.parse(req.body);
    
    // Convert startDate string to Date object
    const workflowData = {
      ...validatedData,
      schedule: {
        ...validatedData.schedule,
        startDate: new Date(validatedData.schedule.startDate)
      },
      status: 'active'
    };

    const workflow = new Workflow(workflowData);
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    } else {
      console.error('Error creating workflow:', error);
      res.status(500).json({ 
        message: 'Error creating workflow',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = WorkflowSchema.partial().parse(req.body);
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating workflow' });
    }
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workflow' });
  }
});

// Toggle workflow status
router.patch('/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    workflow.status = workflow.status === 'active' ? 'paused' : 'active';
    await workflow.save();
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling workflow status' });
  }
});

export default router; */

import express, { Request, Response } from 'express';
import { z } from 'zod';
import Workflow from '../models/Workflow';
import { WorkflowService } from '../services/workflow';
import { validateWalletSignature } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const RecipientSchema = z.object({
  walletAddress: z.string(),
  amount: z.number().positive()
});

const ScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.union([z.date(), z.string().transform((str) => new Date(str))])
});

const WorkflowSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['fixed', 'percentage', 'milestone']),
  recipients: z.array(RecipientSchema),
  schedule: ScheduleSchema
});

// Get all workflows
router.get('/', async (req: Request, res: Response) => {
  try {
    const workflows = await Workflow.find();
    
    // Add nextExecution field for frontend compatibility
    const workflowsWithNextExecution = workflows.map(workflow => {
      const workflowObj = workflow.toObject();
      
      // Calculate next execution date based on frequency and start date
      const startDate = new Date(workflowObj.schedule.startDate);
      let nextExecution = new Date(startDate);
      
      // Simple calculation of next execution based on frequency
      const now = new Date();
      if (now > startDate) {
        switch (workflowObj.schedule.frequency) {
          case 'daily':
            nextExecution = new Date(now.setDate(now.getDate() + 1));
            break;
          case 'weekly':
            nextExecution = new Date(now.setDate(now.getDate() + 7));
            break;
          case 'monthly':
            nextExecution = new Date(now.setMonth(now.getMonth() + 1));
            break;
          case 'yearly':
            nextExecution = new Date(now.setFullYear(now.getFullYear() + 1));
            break;
        }
      }
      
      return {
        ...workflowObj,
        id: workflowObj._id, // Add id field to match frontend expectations
        nextExecution: nextExecution.toISOString().split('T')[0] // Format as YYYY-MM-DD
      };
    });
    
    res.json(workflowsWithNextExecution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows' });
  }
});

// Get single workflow
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    const workflowObj = workflow.toObject();
    
    // Format response to match frontend expectations
    res.json({
      ...workflowObj,
      id: workflowObj._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflow' });
  }
});

// Create workflow
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = WorkflowSchema.parse(req.body);
        
    // Convert startDate string to Date object
    const workflowData = {
      ...validatedData,
      schedule: {
        ...validatedData.schedule,
        startDate: new Date(validatedData.schedule.startDate)
      },
      status: 'active'
    };
    
    const workflow = new Workflow(workflowData);
    await workflow.save();
    
    // Format response for frontend
    const responseData = workflow.toObject();
    res.status(201).json({
      ...responseData,
      id: responseData._id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
         message: 'Validation error',
         errors: error.errors
       });
    } else {
      console.error('Error creating workflow:', error);
      res.status(500).json({
         message: 'Error creating workflow',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Update workflow
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = WorkflowSchema.partial().parse(req.body);
    
    // Fix: Convert startDate string to Date object if present
    const updateData = { ...validatedData };
    if (updateData.schedule?.startDate) {
      updateData.schedule = {
        ...updateData.schedule,
        startDate: new Date(updateData.schedule.startDate)
      };
    }
    
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    const responseData = workflow.toObject();
    res.json({
      ...responseData,
      id: responseData._id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error updating workflow' });
    }
  }
});

// Delete workflow
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workflow' });
  }
});

// Toggle workflow status
router.patch('/:id/toggle-status', async (req: Request, res: Response) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    workflow.status = workflow.status === 'active' ? 'paused' : 'active';
    await workflow.save();
    
    const responseData = workflow.toObject();
    res.json({
      ...responseData,
      id: responseData._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling workflow status' });
  }
});

export default router;