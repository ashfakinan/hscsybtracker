import { supabase, isSupabaseConfigured } from './supabase';
import { DEFAULT_SUBJECTS } from './defaultData';
import type { Subject, Paper, Chapter, ProgressMap, CheckType } from './types';

export function progressKey(chapterId: string, type: CheckType): string {
  return `${chapterId}__${type}`;
}

export function buildProgressMap(entries: { chapter_id: string; type: CheckType }[]): ProgressMap {
  const map: ProgressMap = {};
  for (const e of entries) {
    map[progressKey(e.chapter_id, e.type)] = e.type;
  }
  return map;
}

export async function loadUserData(userId: string): Promise<{ subjects: Subject[]; progress: ProgressMap }> {
  if (!isSupabaseConfigured) {
    const storedSubjects = localStorage.getItem(`hsc_subjects_${userId}`);
    const storedProgress = localStorage.getItem(`hsc_progress_${userId}`);

    if (!storedSubjects) {
      const subjects: Subject[] = DEFAULT_SUBJECTS.map((ds, si) => {
        const subjectId = `subj_${si}_${Date.now()}`;
        return {
          id: subjectId,
          name: ds.name,
          color: ds.color,
          sort_order: si,
          papers: ds.papers.map((dp, pi) => {
            const paperId = `paper_${si}_${pi}_${Date.now()}`;
            return {
              id: paperId,
              name: dp.name,
              sort_order: pi,
              chapters: dp.chapters.map((chName, ci) => ({
                id: `ch_${si}_${pi}_${ci}_${Date.now()}`,
                name: chName,
                sort_order: ci,
              })),
            };
          }),
        };
      });
      localStorage.setItem(`hsc_subjects_${userId}`, JSON.stringify(subjects));
      localStorage.setItem(`hsc_progress_${userId}`, JSON.stringify({}));
      return { subjects, progress: {} };
    }

    const subjects = JSON.parse(storedSubjects);
    const progress = storedProgress ? JSON.parse(storedProgress) : {};
    return { subjects, progress };
  }

  const { data: subjectsRaw } = await supabase
    .from('subjects')
    .select('id, name, color, sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (!subjectsRaw || subjectsRaw.length === 0) {
    await seedDefaultData(userId);
    return loadUserData(userId);
  }

  const subjectIds = subjectsRaw.map((s) => s.id);

  const { data: papersRaw } = await supabase
    .from('papers')
    .select('id, subject_id, name, sort_order')
    .in('subject_id', subjectIds)
    .order('sort_order', { ascending: true });

  const paperIds = (papersRaw || []).map((p) => p.id);

  const { data: chaptersRaw } = await supabase
    .from('chapters')
    .select('id, paper_id, name, sort_order')
    .in('paper_id', paperIds)
    .order('sort_order', { ascending: true });

  const { data: progressRaw } = await supabase
    .from('progress')
    .select('id, chapter_id, type')
    .eq('user_id', userId);

  const papersBySubject: Record<string, Paper[]> = {};
  for (const p of papersRaw || []) {
    if (!papersBySubject[p.subject_id]) papersBySubject[p.subject_id] = [];
    papersBySubject[p.subject_id].push({
      id: p.id,
      name: p.name,
      sort_order: p.sort_order,
      chapters: [],
    });
  }

  const chaptersByPaper: Record<string, Chapter[]> = {};
  for (const c of chaptersRaw || []) {
    if (!chaptersByPaper[c.paper_id]) chaptersByPaper[c.paper_id] = [];
    chaptersByPaper[c.paper_id].push({
      id: c.id,
      name: c.name,
      sort_order: c.sort_order,
    });
  }

  for (const subjId of Object.keys(papersBySubject)) {
    for (const paper of papersBySubject[subjId]) {
      paper.chapters = chaptersByPaper[paper.id] || [];
    }
  }

  const subjects: Subject[] = subjectsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    sort_order: s.sort_order,
    papers: papersBySubject[s.id] || [],
  }));

  const progress = buildProgressMap(progressRaw || []);

  return { subjects, progress };
}

async function seedDefaultData(userId: string): Promise<void> {
  for (let si = 0; si < DEFAULT_SUBJECTS.length; si++) {
    const ds = DEFAULT_SUBJECTS[si];
    const { data: subjRow } = await supabase
      .from('subjects')
      .insert({ user_id: userId, name: ds.name, color: ds.color, sort_order: si })
      .select('id')
      .single();

    if (!subjRow) continue;
    const subjectId = subjRow.id;

    for (let pi = 0; pi < ds.papers.length; pi++) {
      const dp = ds.papers[pi];
      const { data: paperRow } = await supabase
        .from('papers')
        .insert({ subject_id: subjectId, name: dp.name, sort_order: pi })
        .select('id')
        .single();

      if (!paperRow) continue;
      const paperId = paperRow.id;

      const chapterRows = dp.chapters.map((name, ci) => ({
        paper_id: paperId,
        name,
        sort_order: ci,
      }));

      await supabase.from('chapters').insert(chapterRows);
    }
  }
}

export async function addSubject(
  userId: string,
  name: string,
  color: string,
  hasTwoPapers: boolean
): Promise<Subject | null> {
  if (!isSupabaseConfigured) {
    const stored = localStorage.getItem(`hsc_subjects_${userId}`);
    const subjects: Subject[] = stored ? JSON.parse(stored) : [];
    const sortOrder = subjects.length;
    const subjectId = `subj_${Date.now()}`;
    const papers: Paper[] = hasTwoPapers
      ? [
          { id: `p1_${Date.now()}`, name: `${name} ১ম পত্র`, sort_order: 0, chapters: [] },
          { id: `p2_${Date.now()}`, name: `${name} ২য় পত্র`, sort_order: 1, chapters: [] },
        ]
      : [
          { id: `p1_${Date.now()}`, name, sort_order: 0, chapters: [] },
        ];

    const newSubj: Subject = {
      id: subjectId,
      name,
      color,
      sort_order: sortOrder,
      papers,
    };
    subjects.push(newSubj);
    localStorage.setItem(`hsc_subjects_${userId}`, JSON.stringify(subjects));
    return newSubj;
  }

  const { count } = await supabase
    .from('subjects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  const sortOrder = count || 0;

  const { data: subjRow } = await supabase
    .from('subjects')
    .insert({ user_id: userId, name, color, sort_order: sortOrder })
    .select('id')
    .single();
  if (!subjRow) return null;

  const subjectId = subjRow.id;
  const papers = hasTwoPapers
    ? [
        { name: `${name} ১ম পত্র`, sort_order: 0 },
        { name: `${name} ২য় পত্র`, sort_order: 1 },
      ]
    : [{ name, sort_order: 0 }];

  const paperRows: Paper[] = [];
  for (const p of papers) {
    const { data: pr } = await supabase
      .from('papers')
      .insert({ subject_id: subjectId, name: p.name, sort_order: p.sort_order })
      .select('id, name, sort_order')
      .single();
    if (pr) paperRows.push({ ...pr, chapters: [] });
  }

  return { id: subjectId, name, color, sort_order: sortOrder, papers: paperRows };
}

export async function addChapter(paperId: string, name: string): Promise<Chapter | null> {
  if (!isSupabaseConfigured) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hsc_subjects_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const subjects: Subject[] = JSON.parse(stored);
          let found = false;
          let newChapter: Chapter | null = null;
          for (const s of subjects) {
            for (const p of s.papers) {
              if (p.id === paperId) {
                const sortOrder = p.chapters.length;
                newChapter = {
                  id: `ch_${Date.now()}_${Math.random()}`,
                  name,
                  sort_order: sortOrder,
                };
                p.chapters.push(newChapter);
                found = true;
                break;
              }
            }
            if (found) break;
          }
          if (found) {
            localStorage.setItem(key, JSON.stringify(subjects));
            return newChapter;
          }
        }
      }
    }
    return null;
  }

  const { count } = await supabase
    .from('chapters')
    .select('id', { count: 'exact', head: true })
    .eq('paper_id', paperId);

  const sortOrder = count || 0;

  const { data } = await supabase
    .from('chapters')
    .insert({ paper_id: paperId, name, sort_order: sortOrder })
    .select('id, name, sort_order')
    .single();

  return data ? { id: data.id, name: data.name, sort_order: data.sort_order } : null;
}

export async function toggleProgress(
  userId: string,
  chapterId: string,
  type: CheckType,
  checked: boolean
): Promise<void> {
  if (!isSupabaseConfigured) {
    const key = `hsc_progress_${userId}`;
    const stored = localStorage.getItem(key);
    const progress: ProgressMap = stored ? JSON.parse(stored) : {};
    const pk = progressKey(chapterId, type);
    if (checked) {
      progress[pk] = type;
    } else {
      delete progress[pk];
    }
    localStorage.setItem(key, JSON.stringify(progress));
    return;
  }

  if (checked) {
    await supabase
      .from('progress')
      .insert({ user_id: userId, chapter_id: chapterId, type });
  } else {
    await supabase
      .from('progress')
      .delete()
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .eq('type', type);
  }
}
