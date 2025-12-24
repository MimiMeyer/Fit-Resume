export type Project = {
  id: number;
  title: string;
  description?: string | null;
  link?: string | null;
  technologies: string[];
};
