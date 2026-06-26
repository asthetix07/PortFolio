// Define the shape of your Supabase database tables

export type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  tags: string[];
  created_at: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  cover_url: string | null;
  published: boolean;
  created_at: string;
};

export type WorkExperience = {
  id: string;
  company: string;
  role: string;
  timeframe: string;
  achievements: string[];
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type TechnicalSkill = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
  sort_order: number;
  created_at: string;
};
