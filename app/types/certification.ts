export type Certification = {
  id: number;
  name: string;
  issuer?: string | null;
  issuedYear?: number | null;
  credentialUrl?: string | null;
};

