import mongoose, { Schema, Document } from 'mongoose';


export interface IBudget extends Document {
  name: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  category: string;
  status: 'active' | 'inactive' | 'depleted';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  category: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['active', 'inactive', 'depleted'],
    default: 'active'
  },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.model<IBudget>('Budget', BudgetSchema); 