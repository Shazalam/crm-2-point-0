export interface ITenant {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  emailVerified: boolean;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  dbStrategy: "shared" | "dedicated";
  dbConnectionString?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  features: {
    maxPipelines: number;
    maxUsers: number;
    maxEntitiesPerPipeline: number;
    customBranding: boolean;
    apiAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Safe tenant response (excludes sensitive fields)
 */
export interface ITenantResponse {
  id: string;
  name: string;
  slug: string;
  email: string;
  otpExpiresIn: Date;
  requiresVerification: boolean,
  emailVerified?: boolean;
  phoneNumber?: string;
  createdAt: string;
}

/**
 * DTO for tenant registration
 * Only contains fields that frontend can send
 */
export interface CreateTenantDto {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Internal DTO after validation and transformation
 * Used to create database record
 */
export interface CreateTenantInternalDto {
  name: string;
  slug: string;
  email: string;
  password: string; // Will be hashed before saving
  phoneNumber?: string;
  plan: 'free';
  dbStrategy: 'shared';
  features: {
    maxPipelines: number;
    maxUsers: number;
    maxEntitiesPerPipeline: number;
    customBranding: boolean;
    apiAccess: boolean;
  };
}

/**
 * Response from /api/tenant/register endpoint
 */
export interface RegisterTeaentResponse {
  tenant: ITenantResponse;
}

/**
 * DTO for updating tenant
 */
export interface UpdateTenantDto {
  name?: string;
  phoneNumber?: string;
  plan?: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface VerifyOtpResponse {
  // Optionally return a safe tenant payload so UI can update state
  tenant: ITenantResponse;
}
