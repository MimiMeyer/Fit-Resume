export type ProfileBackupV1 = {
  schemaVersion: 1;
  exportedAt: string; // ISO string
  profile: {
    fullName: string;
    headline?: string | null;
    summary?: string | null;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    websiteUrl?: string | null;
  };
  experiences: Array<{
    role: string;
    company: string;
    location?: string | null;
    period?: string | null;
    impact?: string | null;
  }>;
  projects: Array<{
    title: string;
    description?: string | null;
    link?: string | null;
    technologies: string[];
  }>;
  educations: Array<{
    institution: string;
    degree?: string | null;
    field?: string | null;
    startYear?: number | null;
    endYear?: number | null;
    details?: string | null;
  }>;
  certs: Array<{
    name: string;
    issuer?: string | null;
    issuedYear?: number | null;
    credentialUrl?: string | null;
  }>;
  skills: Array<{
    name: string;
    category: string;
  }>;
};

export type ProfileBackup = ProfileBackupV1;

