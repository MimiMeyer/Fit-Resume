export type Education = {
  id: number;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  details?: string | null;
};
