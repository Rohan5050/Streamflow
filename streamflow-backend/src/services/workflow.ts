import Workflow from '../models/Workflow';
import { z } from 'zod';

// Validation schemas
const RecipientSchema = z.object({
  walletAddress: z.string(),
  amount: z.number().positive()
});

const ScheduleSchema = z.object({
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string().datetime()
});

const WorkflowSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['fixed', 'percentage', 'milestone']),
  recipients: z.array(RecipientSchema),
  schedule: ScheduleSchema
});

export class WorkflowService {
  static async createWorkflow(data: z.infer<typeof WorkflowSchema>) {
    const workflow = new Workflow({
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await workflow.save();
    return workflow;
  }

  static async getWorkflows() {
    return Workflow.find().sort({ createdAt: -1 });
  }

  static async getWorkflowById(id: string) {
    return Workflow.findById(id);
  }

  static async updateWorkflow(id: string, data: Partial<z.infer<typeof WorkflowSchema>>) {
    return Workflow.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  static async deleteWorkflow(id: string) {
    return Workflow.findByIdAndDelete(id);
  }
} 