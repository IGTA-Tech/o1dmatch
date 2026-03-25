// src/app/(dashboard)/dashboard/admin/enterprise-tiers/types.ts

export interface UserRow {
    id:             string;
    email:          string;
    full_name:      string | null;
    role:           string;
    company_name:   string | null;
    law_firm:       string | null;
    created_at:     string;
    assigned_tiers: string[];
    assigned_tier:  string | null;
    is_partner:     boolean;
  }