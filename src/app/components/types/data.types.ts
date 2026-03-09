export interface FilePreview {
  uploadPhoto: string | null;
  signature: string | null;
}

export type StaffRegistrationForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  profilePhoto: File | null;
};

export type TeacherRegistrationForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  profilePhoto: File | null;
};

export type AdminProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export type StaffFormErrors = {
  [K in keyof StaffRegistrationForm]?: string;
};

export interface FilePreviewForStaff {
  profilePhoto: string | null;
}

export type FormErrorsState = {
  general?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
};

// Batch interface based on mobile app session form
export interface Batch {
  id: string; // Format: BF-YYYYMMDD-XXX (batchId)
  sessionId?: string; // session_id from Railway API for deletion
  date: string; // Session date
  species: string; // Fish species
  location: string; // Location field
  notes?: string; // Notes about the session
  totalFingerlings: number; // For distribution tracking
  fingerlingsCount: number; // Total count from session counts
  imageUrl?: string; // Optional image URL from session
}

// Distribution interface for fingerling distributions
export interface Distribution {
  id: string;
  beneficiaryType: "Individual" | "Organization";
  beneficiary: string;
  phoneNumber: string;
  species: string;
  batchId: string;
  fingerlingsCount: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  location: string;
  facilityType: string;
  date: string;
  forecast: string;
  harvestDate: string;
  deletedAt?: string | null;
  isDeleted?: boolean;
  // Updated harvest tracking fields
  expectedHarvestDate?: string;
  forecastedHarvestDate?: string;
  actualHarvestDate?: string;
  forecastedHarvestKilos?: number;
  actualHarvestKilos?: number;
  remarks?:
    | "Harvested"
    | "Not Harvested"
    | "Damaged"
    | "Ongoing"
    | "Disaster"
    | "Other"
    | "";
  customRemarks?: string;
}
