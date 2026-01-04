export type ProfileBackup = {
  exportedAt: string; // ISO string
  profile: {
    fullName: string;
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
    impactBullets: string[];
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

