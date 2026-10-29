import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/LoginScreen';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { AddSubjectModal, AddChapterModal, BulkAddModal } from '@/components/Modals';
import {
  loadUserData,
  addSubject as addSubjectDb,
  addChapter as addChapterDb,
  toggleProgress,
  progressKey,
} from '@/lib/data';
import type { Subject, ProgressMap, CheckType } from '@/lib/types';

type ModalType = 'addSubject' | 'addChapter' | 'bulkAdd' | null;

function App() {
  const { user, loading, signInWithEmail, signUpWithEmail, signOut, signInAsDemo, isSupabaseConfigured } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loadedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setProgress({});
      setCurrentSubjectId(null);
      loadedUserId.current = null;
      return;
    }

    if (loadedUserId.current === user.id) return;
    loadedUserId.current = user.id;

    (async () => {
      setDataLoading(true);
      try {
        const { subjects: subs, progress: prog } = await loadUserData(user.id);
        setSubjects(subs);
        setProgress(prog);
        if (subs.length > 0) {
          setCurrentSubjectId(subs[0].id);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user]);

  const handleToggle = useCallback(
    (chapterId: string, type: CheckType, checked: boolean) => {
      if (!user) return;

      setProgress((prev) => {
        const next = { ...prev };
        const key = progressKey(chapterId, type);
        if (checked) next[key] = type;
        else delete next[key];
        return next;
      });

      toggleProgress(user.id, chapterId, type, checked).catch((err) => {
        console.error('Failed to sync progress:', err);
      });
    },
    [user]
  );

  const handleAddSubject = useCallback(
    async (name: string, color: string, hasTwoPapers: boolean) => {
      if (!user) return;
      const subj = await addSubjectDb(user.id, name, color, hasTwoPapers);
      if (subj) {
        setSubjects((prev) => [...prev, subj]);
        setCurrentSubjectId(subj.id);
      }
    },
    [user]
  );

  const handleAddChapter = useCallback(
    async (subjectId: string, paperId: string, name: string) => {
      const ch = await addChapterDb(paperId, name);
      if (ch) {
        setSubjects((prev) =>
          prev.map((s) =>
            s.id !== subjectId
              ? s
              : {
                  ...s,
                  papers: s.papers.map((p) =>
                    p.id !== paperId ? p : { ...p, chapters: [...p.chapters, ch] }
                  ),
                }
          )
        );
        setCurrentSubjectId(subjectId);
      }
    },
    []
  );

  const handleBulkAdd = useCallback(
    async (subjectId: string, paperId: string, chapters: string[]) => {
      const newChapters: { id: string; name: string; sort_order: number }[] = [];
      for (const name of chapters) {
        const ch = await addChapterDb(paperId, name);
        if (ch) newChapters.push(ch);
      }
      if (newChapters.length > 0) {
        setSubjects((prev) =>
          prev.map((s) =>
            s.id !== subjectId
              ? s
              : {
                  ...s,
                  papers: s.papers.map((p) =>
                    p.id !== paperId ? p : { ...p, chapters: [...p.chapters, ...newChapters] }
                  ),
                }
          )
        );
        setCurrentSubjectId(subjectId);
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const selectSubject = useCallback((id: string) => {
    setCurrentSubjectId(id);
    setSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--fg3)' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onSignIn={signInWithEmail}
        onSignUp={signUpWithEmail}
        onSignInAsDemo={signInAsDemo}
        isSupabaseConfigured={isSupabaseConfigured}
      />
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm" style={{ color: 'var(--fg3)' }}>Loading your syllabus...</p>
      </div>
    );
  }

  const currentSubject = subjects.find((s) => s.id === currentSubjectId) || null;

  return (
    <>
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar — single instance, CSS handles desktop/mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className="sidebar-container z-50"
          data-open={sidebarOpen}
        >
          <Sidebar
            subjects={subjects}
            progress={progress}
            currentSubjectId={currentSubjectId}
            onSelectSubject={selectSubject}
            onAddSubject={() => { setSidebarOpen(false); setActiveModal('addSubject'); }}
            onAddChapter={() => { setSidebarOpen(false); setActiveModal('addChapter'); }}
            onBulkAdd={() => { setSidebarOpen(false); setActiveModal('bulkAdd'); }}
            onSignOut={handleSignOut}
          />
        </div>

        <MainContent
          subject={currentSubject}
          progress={progress}
          onToggle={handleToggle}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      <AddSubjectModal
        open={activeModal === 'addSubject'}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddSubject}
      />
      <AddChapterModal
        open={activeModal === 'addChapter'}
        subjects={subjects}
        currentSubjectId={currentSubjectId}
        onClose={() => setActiveModal(null)}
        onAdd={handleAddChapter}
      />
      <BulkAddModal
        open={activeModal === 'bulkAdd'}
        subjects={subjects}
        currentSubjectId={currentSubjectId}
        onClose={() => setActiveModal(null)}
        onAdd={handleBulkAdd}
      />
    </>
  );
}

export default App;
