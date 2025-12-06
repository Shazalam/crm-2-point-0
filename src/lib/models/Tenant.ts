// models/Tenant.ts
import { Schema, model, models } from "mongoose";
import { ITenant } from "@/lib/types/tenant";

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [100, 'Company name must not exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include in queries by default
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    plan: {
      type: String,
      enum: {
        values: ['free', 'starter', 'pro', 'enterprise'],
        message: '{VALUE} is not a valid plan',
      },
      default: 'free',
    },
    dbStrategy: {
      type: String,
      enum: ['shared', 'dedicated'],
      default: 'shared',
    },
    dbConnectionString: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    trialEndsAt: Date,
    features: {
      maxPipelines: { type: Number, default: 3 },
      maxUsers: { type: Number, default: 5 },
      maxEntitiesPerPipeline: { type: Number, default: 100 },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    // toJSON: {
    //   transform: function (doc, ret) {
    //     // Transform _id to id and remove password
    //     ret.id = ret._id;
    //     delete ret._id;
    //     delete ret.__v;
    //     delete ret.password;
    //     return ret;
    //   },
    // },
  }
);

// Indexes for performance
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ email: 1 }, { unique: true });
TenantSchema.index({ stripeCustomerId: 1 });
TenantSchema.index({ createdAt: -1 });

// Pre-save middleware to set trial period
TenantSchema.pre('save', function (next) {
  if (this.isNew && !this.trialEndsAt) {
    // Set 14-day trial for new tenants
    this.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Tenant = models.Tenant || model<ITenant>('Tenant', TenantSchema);
export default Tenant;
