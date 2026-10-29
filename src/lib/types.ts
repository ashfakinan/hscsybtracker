export type CheckType = 'theory' | 'cq' | 'mcq';

export interface Subject {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  papers: Paper[];
}

export interface Paper {
  id: string;
  name: string;
  sort_order: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  sort_order: number;
}

export interface ProgressEntry {
  id: string;
  chapter_id: string;
  type: CheckType;
}

export type ProgressMap = Record<string, CheckType>;
