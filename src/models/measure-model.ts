import mongoose, { Schema, Document, Types } from 'mongoose';

export enum MeasureType {
  water = 'WATER',
  gas = 'GAS',
}

export interface IMeasure extends Document {
  customer_code: string;
  type: string;
  datetime: Date;
  value: number;
  image: string;
  image_url?: string;
  has_confirmed?: boolean;

  created_at?: Date;
  updated_at?: Date;
}

const MeasureSchema: Schema = new Schema<IMeasure>(
  {
    customer_code: { type: String, required: true },
    type: { type: String, enum: Object.values(MeasureType), required: true },
    datetime: { type: Date, required: true },
    value: { type: Number, required: true },
    image: { type: String, required: true },

    image_url: { type: String, required: false },
    has_confirmed: { type: Boolean, required: false },
  }, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const MeasureModel = mongoose.model<IMeasure>('Measure', MeasureSchema);