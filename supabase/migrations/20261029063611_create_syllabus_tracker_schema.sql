/*
# HSC Syllabus Tracker — Database Schema

1. New Tables
- `subjects` — top-level subjects (e.g. Physics, Chemistry), owned by a user.
  - id (uuid PK), user_id (uuid FK auth.users, DEFAULT auth.uid()), name (text), color (text), sort_order (int), created_at
- `papers` — papers within a subject (e.g. "1st Paper", "2nd Paper").
  - id (uuid PK), subject_id (uuid FK subjects ON DELETE CASCADE), name (text), sort_order (int), created_at
- `chapters` — chapters within a paper.
  - id (uuid PK), paper_id (uuid FK papers ON DELETE CASCADE), name (text), sort_order (int), created_at
- `progress` — checkbox state per chapter per type (theory/cq/mcq) per user.
  - id (uuid PK), user_id (uuid FK auth.users DEFAULT auth.uid()), chapter_id (uuid FK chapters ON DELETE CASCADE), type (text check theory|cq|mcq), created_at
  - UNIQUE(user_id, chapter_id, type) so each checkbox is one row

2. Security
- RLS enabled on all four tables.
- Grants to `authenticated` only (app requires sign-in via Google).
- subjects: direct ownership check auth.uid() = user_id.
- papers: ownership via parent subject.
- chapters: ownership via parent paper -> subject.
- progress: direct ownership check auth.uid() = user_id.
- 4 policies (select/insert/update/delete) per table.
*/

CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#4f63d2',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('theory','cq','mcq')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, chapter_id, type)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_paper ON chapters(paper_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_chapter ON progress(user_id, chapter_id);

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON papers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chapters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON progress TO authenticated;

-- subjects policies
DROP POLICY IF EXISTS "select_own_subjects" ON subjects;
CREATE POLICY "select_own_subjects" ON subjects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_subjects" ON subjects;
CREATE POLICY "insert_own_subjects" ON subjects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_subjects" ON subjects;
CREATE POLICY "update_own_subjects" ON subjects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_subjects" ON subjects;
CREATE POLICY "delete_own_subjects" ON subjects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- papers policies (ownership via parent subject)
DROP POLICY IF EXISTS "select_own_papers" ON papers;
CREATE POLICY "select_own_papers" ON papers FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = papers.subject_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_papers" ON papers;
CREATE POLICY "insert_own_papers" ON papers FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = papers.subject_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_papers" ON papers;
CREATE POLICY "update_own_papers" ON papers FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = papers.subject_id AND subjects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = papers.subject_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_papers" ON papers;
CREATE POLICY "delete_own_papers" ON papers FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = papers.subject_id AND subjects.user_id = auth.uid()));

-- chapters policies (ownership via paper -> subject)
DROP POLICY IF EXISTS "select_own_chapters" ON chapters;
CREATE POLICY "select_own_chapters" ON chapters FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM papers JOIN subjects ON subjects.id = papers.subject_id WHERE papers.id = chapters.paper_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_chapters" ON chapters;
CREATE POLICY "insert_own_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM papers JOIN subjects ON subjects.id = papers.subject_id WHERE papers.id = chapters.paper_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_chapters" ON chapters;
CREATE POLICY "update_own_chapters" ON chapters FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM papers JOIN subjects ON subjects.id = papers.subject_id WHERE papers.id = chapters.paper_id AND subjects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM papers JOIN subjects ON subjects.id = papers.subject_id WHERE papers.id = chapters.paper_id AND subjects.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_chapters" ON chapters;
CREATE POLICY "delete_own_chapters" ON chapters FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM papers JOIN subjects ON subjects.id = papers.subject_id WHERE papers.id = chapters.paper_id AND subjects.user_id = auth.uid()));

-- progress policies (direct ownership)
DROP POLICY IF EXISTS "select_own_progress" ON progress;
CREATE POLICY "select_own_progress" ON progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_progress" ON progress;
CREATE POLICY "insert_own_progress" ON progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_progress" ON progress;
CREATE POLICY "update_own_progress" ON progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_progress" ON progress;
CREATE POLICY "delete_own_progress" ON progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
