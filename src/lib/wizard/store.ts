import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VerticalKey } from "@/lib/verticals/registry";
import type { CreateBusiness } from "@/lib/schemas/business";
import type { CreateBranch } from "@/lib/schemas/branch";
import type { CreateService } from "@/lib/schemas/service";
import type { AvailabilitySlot } from "@/lib/schemas/availability";

export interface WizardStaffEntry {
  tempId: string;
  display_name: string;
  slug: string;
  user_id?: string;
  invite_email?: string;
  serviceIndices: number[];
  schedule: AvailabilitySlot[];
}

export interface WizardMessaging {
  whatsapp_number?: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  default_cancellation_hours: number;
}

export interface WizardCommitState {
  lastSuccessfulStep: number;
  businessId?: string;
  branchId?: string;
  serviceIds?: string[];
  staffIds?: Record<string, string>;
  errors: Record<number, string>;
}

export interface WizardState {
  vertical?: VerticalKey;
  business?: Partial<CreateBusiness>;
  branch?: Partial<CreateBranch>;
  services: CreateService[];
  staff: WizardStaffEntry[];
  messaging?: Partial<WizardMessaging>;
  commit: WizardCommitState;
}

interface WizardStore extends WizardState {
  setVertical: (v: VerticalKey) => void;
  setBusiness: (b: Partial<CreateBusiness>) => void;
  setBranch: (b: Partial<CreateBranch>) => void;
  setServices: (s: CreateService[]) => void;
  setStaff: (s: WizardStaffEntry[]) => void;
  setMessaging: (m: Partial<WizardMessaging>) => void;
  updateCommit: (c: Partial<WizardCommitState>) => void;
  resetWizard: () => void;
}

const INITIAL_STATE: WizardState = {
  vertical: undefined,
  business: undefined,
  branch: undefined,
  services: [],
  staff: [],
  messaging: undefined,
  commit: { lastSuccessfulStep: 0, errors: {} },
};

export const useWizard = create<WizardStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setVertical: (vertical) => set({ vertical }),
      setBusiness: (business) => set({ business }),
      setBranch: (branch) => set({ branch }),
      setServices: (services) => set({ services }),
      setStaff: (staff) => set({ staff }),
      setMessaging: (messaging) => set({ messaging }),
      updateCommit: (c) => set((s) => ({ commit: { ...s.commit, ...c } })),
      resetWizard: () => set(INITIAL_STATE),
    }),
    {
      name: "klyro.wizard.v1",
      partialize: (state) => ({
        vertical: state.vertical,
        business: state.business,
        branch: state.branch,
        services: state.services,
        staff: state.staff,
        messaging: state.messaging,
        commit: state.commit,
      }),
    }
  )
);
