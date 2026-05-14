export type UserRole = "admin" | "finance";

export type RecordStatus =
  | "active"
  | "blocked"
  | "pending"
  | "confirmed"
  | "paid"
  | "voided";

export type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  status: "active" | "blocked";
  phone: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  token_type: "Bearer";
  user: User;
};

export type AuthorizedReceiver = {
  id: number;
  name: string;
  relationship_or_role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CashHandover = {
  id: number;
  handover_code: string;
  handover_date: string;
  handover_time: string;
  amount: string;
  finance_note: string | null;
  admin_note: string | null;
  status: "pending" | "confirmed" | "voided";
  confirmed_at: string | null;
  handed_by?: User;
  handed_to?: AuthorizedReceiver;
  confirmed_by?: User | null;
  created_at: string;
  updated_at: string;
};

export type CollectionResponse<T> = {
  data: T[];
  links?: unknown;
  meta?: unknown;
};

export type FinanceDashboardResponse = {
  summary: {
    submitted_handovers_count: number;
    pending_handovers: number;
    confirmed_handovers: number;
    current_month_submitted_amount: number;
  };
  recent_handovers: CashHandover[] | CollectionResponse<CashHandover>;
};

export type Supplier = {
  id: number;
  supplier_code: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
};

export type SupplierPayment = {
  id: number;
  payment_code: string;
  payment_date: string;
  payment_time: string;
  supplier?: Supplier;
  amount: string;
  purpose: string;
  invoice_number: string | null;
  received_by: string | null;
  admin_note: string | null;
  status: "paid" | "voided";
  created_by?: User;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: number;
  user?: User | null;
  action: string;
  module: string;
  record_type: string;
  record_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AdminDashboardResponse = {
  period: {
    key: string;
    start_date: string;
    end_date: string;
  };
  kpis: {
    today_cash_in: number;
    today_supplier_payments: number;
    current_cash_balance: number;
    pending_cash_handovers: number;
    total_cash_in: number;
    total_cash_out: number;
    average_daily_cash_in: number;
    average_daily_cash_out: number;
    maximum_cash_in: number;
    minimum_cash_in: number;
  };
  charts: {
    daily_cash_in_vs_out: {
      cash_in: Array<{ date: string; amount: number }>;
      cash_out: Array<{ date: string; amount: number }>;
    };
    finance_user_cash_handovers: Array<{
      user_id: number;
      user_name: string;
      handovers_count: number;
      total_amount: number;
    }>;
    supplier_payments: Array<{
      supplier_id: number;
      supplier_name: string;
      payments_count: number;
      total_amount: number;
    }>;
  };
};
