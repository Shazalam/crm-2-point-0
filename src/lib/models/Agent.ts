import mongoose, { Schema, Document } from "mongoose";

export interface IAgent extends Document {
  name: string;
  email: string;
  password: string;
  // userType: "Agent" | "SuperAdmin";
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // userType: { type: String, enum: ["Agent", "SuperAdmin"], default: "Agent" },
  },
  { timestamps: true }
);

export default mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);
