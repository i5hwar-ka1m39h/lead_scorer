import { normalize } from "./normalize.js";

const decisionMakerRoles = [
  "founder",
  "cofounder",
  "ceo",
  "chief",
  "head",
  "director",
  "vp",
  "vice president",
  "owner",
];

const influencerRoles = [
  "manager",
  "lead",
  "specialist",
  "consultant",
  "executive",
  "supervisor",
];

export const getRoleScore = (role: string): number => {
  const normalizedString = normalize(role);

  if (decisionMakerRoles.some((word) => normalizedString.includes(word))) {
    return 20;
  }

  if (influencerRoles.some((word) => normalizedString.includes(word))) {
    return 10;
  }

  return 0;
};

export const getIndustryScore = (
  leadIndustry: string,
  offerIndustry: string[]
): number => {
  const normalizeLeadIndustry = normalize(leadIndustry);

  for (const single of offerIndustry) {
    if (normalizeLeadIndustry.includes(normalize(single))) {
      return 20;
    }
  }

  const synonyms: Record<string, string[]> = {
    saas: ["software", "cloud", "programming", "platform"],
    hrtech: ["hr", "human resources", "recruitement"],
    fintech: ["finamce", "banking", "payments"],
  };

  for (const [key, word] of Object.entries(synonyms)) {
    if (
      normalizeLeadIndustry.includes(key) ||
      word.some((singleWord) => normalizeLeadIndustry.includes(singleWord))
    ) {
      return 10;
    }
  }

  return 0;
};

export type Lead = {
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  linkedIn_bio: string;
};

export type Offer = {
  name: string;
  value_prop: string[];
  ideal_use_cases: string[];
};



export const dataCompletenessScore = (lead: Lead): number => {
  const requiredFields = [
    lead.name,
    lead.role,
    lead.company,
    lead.industry,
    lead.location,
    lead.linkedIn_bio,
  ];

  const allExist = requiredFields.every(
    (field) => field && field.trim() !== ""
  );
  return allExist ? 10 : 0;
};


