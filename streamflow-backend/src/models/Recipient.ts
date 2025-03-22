import mongoose, { Schema, Document } from 'mongoose';


export interface IRecipient extends Document {
  name: string;
  walletAddress: string;
  email?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const RecipientSchema: Schema = new Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true },
  email: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.model<IRecipient>('Recipient', RecipientSchema); 