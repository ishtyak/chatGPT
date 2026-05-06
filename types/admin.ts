export type AdminRole =
  | "super_admin"
  | "admin"
  | "support"
  | "analyst"
  | "editor"
  | "billing"
  | "ops";
export type UserStatus = "active" | "suspended" | "unverified";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "trialing"
  | "canceled"
  | "incomplete";
export type PlanCycle = "monthly" | "yearly";
export type ProviderStatus = "active" | "error" | "disabled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PromptStatus = "published" | "draft";
export type ToolStatus = "active" | "draft" | "archived";
export type NotificationStatus = "scheduled" | "sent" | "draft";
export type NotificationType = "announcement" | "email" | "in_app";
export type FeatureFlagKey =
  | "new_chat"
  | "tools_dir"
  | "prompt_library"
  | "referral_program";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  aiCallQuota: number;
  modelAccess: string[];
  features: string[];
  isActive: boolean;
  sortOrder: number;
  activeSubscribers: number;
  revenueMonthly: number;
  revenueYearly: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  cycle: PlanCycle;
  amount: number;
  currency: string;
  startedAt: string;
  currentPeriodEnd: string;
  canceledAt?: string | null;
  paymentStatus: PaymentStatus;
  provider: string;
  externalSubscriptionId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: UserStatus;
  planId: string;
  aiUsage: number;
  joinedAt: string;
  lastActiveAt: string;
  country: string;
  source: string;
  totalSpent: number;
  usageMinutes: number;
  chatCount: number;
  templateCount: number;
  toolClicks: number;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  ipAddress: string;
  location: string;
  status: "active" | "expired" | "revoked";
  startedAt: string;
  lastSeenAt: string;
}

export interface ProviderUsage {
  providerId: string;
  providerName: string;
  monthlyUsage: number;
  monthlyLimit: number;
  errorRate: number;
  averageLatencyMs: number;
  lastCheckedAt: string;
}

export interface AIProvider {
  id: string;
  name: string;
  slug: string;
  isEnabled: boolean;
  status: ProviderStatus;
  priority: number;
  maskedApiKey: string;
  models: string[];
  fallbackOrder: string[];
  usage: ProviderUsage;
  monthlyUsage: number;
  monthlyLimit: number;
  healthMessage: string;
  lastCheckedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
  usageCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  status: PromptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  url: string;
  logoUrl: string;
  tags: string[];
  isFeatured: boolean;
  status: ToolStatus;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  audience: string;
  status: NotificationStatus;
  scheduleAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  ipAddress: string;
  createdAt: string;
  severity: "info" | "warning" | "critical";
}

export interface AppSettings {
  siteName: string;
  supportEmail: string;
  contactUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  logoUrl: string;
  primaryColor: string;
  brandTagline: string;
  emailFromName: string;
  emailFromAddress: string;
}

export interface FeatureFlags {
  new_chat: boolean;
  tools_dir: boolean;
  prompt_library: boolean;
  referral_program: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  category?: string;
  name?: string;
  color?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastSeenAt: string;
  status: "active" | "revoked" | "expired";
}
