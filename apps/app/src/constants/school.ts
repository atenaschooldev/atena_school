import { DEFAULT_SCHOOL_PROFILE } from "@atena/core";

export const SCHOOL_INFO = {
  NAME: DEFAULT_SCHOOL_PROFILE.name || "",
  LEGAL_NAME: DEFAULT_SCHOOL_PROFILE.legal_name || DEFAULT_SCHOOL_PROFILE.name || "",
  ADDRESS: `${DEFAULT_SCHOOL_PROFILE.address || ""}, ${DEFAULT_SCHOOL_PROFILE.cap || ""} - ${DEFAULT_SCHOOL_PROFILE.city || ""} (${DEFAULT_SCHOOL_PROFILE.province || ""})`,
  PHONE: DEFAULT_SCHOOL_PROFILE.landline || DEFAULT_SCHOOL_PROFILE.phone || "",
  WHATSAPP: (DEFAULT_SCHOOL_PROFILE.whatsapp || DEFAULT_SCHOOL_PROFILE.phone || "").replace(/^\+39\s*/, ""),
  EMAIL: DEFAULT_SCHOOL_PROFILE.email || "",
  WEBSITE: DEFAULT_SCHOOL_PROFILE.website || "",
  VAT_CODE: DEFAULT_SCHOOL_PROFILE.vat_code || "",
  SECRETARIAT_HOURS: DEFAULT_SCHOOL_PROFILE.secretariat_hours || "",
} as const;

