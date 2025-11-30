import mongoose, { Document, Schema } from "mongoose";

export interface IRentalCompany extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const rentalCompaniesSchema = new Schema<IRentalCompany>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true } // ✅ Automatically adds createdAt & updatedAt
);

const RentalCompany =
  mongoose.models.RentalCompany ||
  mongoose.model<IRentalCompany>("RentalCompany", rentalCompaniesSchema);

export default RentalCompany;
