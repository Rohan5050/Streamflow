import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  type: 'fixed' | 'percentage' | 'milestone';
  recipients: {
    walletAddress: string;
    amount: number;
  }[];
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
  };
  status: 'active' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowSchema = new Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['fixed', 'percentage', 'milestone']
  },
  recipients: [{
    walletAddress: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 }
  }],
  schedule: {
    frequency: { 
      type: String, 
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    startDate: { type: Date, required: true }
  },
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'paused'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema); 