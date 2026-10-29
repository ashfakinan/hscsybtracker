import { memo } from 'react';
import { Menu } from 'lucide-react';
import type { Subject, ProgressMap, CheckType } from '@/lib/types';
import { progressKey } from '@/lib/data';
import { ChapterCard } from './ChapterCard';

interface MainContentProps {
  subject: Subject | null;
  progress: ProgressMap;
  onToggle: (chapterId: string, type: CheckType, checked: boolean) => void;
  onOpenSidebar: () => void;
}

function subjectStats(subject: Subject, progress: ProgressMap) {
  let totalCh = 0;
  let doneCh = 0;
  let totalChecks = 0;
  let doneChecks = 0;
  const types: CheckType[] = ['theory', 'cq', 'mcq'];

  for (const paper of subject.papers) {
    for (const ch of paper.chapters) {
      totalCh++;
      totalChecks += 3;
      const allThree = types.every((t) => progress[progressKey(ch.id, t)]);
      if (allThree) doneCh++;
      for (const t of types) {
        if (progress[progressKey(ch.id, t)]) doneChecks++;
      }
    }
  }

  return {
    pct: totalChecks === 0 ? 0 : Math.round((doneChecks / totalChecks) * 100),
    doneCh,
    totalCh,
  };
}

function MainContentImpl({ subject, progress, onToggle, onOpenSidebar }: MainContentProps) {
  if (!subject) {
    return (
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 flex items-center justify-center p-5 text-center" style={{ color: 'var(--fg3)' }}>
          <p className="text-sm">Select a subject from the sidebar to start tracking.</p>
        </div>
      </main>
    );
  }

  const { pct, doneCh, totalCh } = subjectStats(subject, progress);

  return (
    <main className="flex-1 flex flex-col overflow-hidden min-w-0">
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5 flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="lg:hidden flex-shrink-0 p-1.5 rounded-md"
            style={{ border: 'none', background: 'transparent', color: 'var(--fg)' }}
            onClick={onOpenSidebar}
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: 'var(--fg)' }}>
              {subject.name}
            </h2>
            <p className="text-xs mt-px" style={{ color: 'var(--fg3)' }}>
              {pct}% complete · {doneCh}/{totalCh} chapters fully done
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 items-center flex-shrink-0">
          <StatPill color="var(--theory)" label="Theory" />
          <StatPill color="var(--cq)" label="CQ" />
          <StatPill color="var(--mcq)" label="MCQ" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {subject.papers.map((paper) => {
          let paperDone = 0;
          let paperChecks = 0;
          const types: CheckType[] = ['theory', 'cq', 'mcq'];
          for (const ch of paper.chapters) {
            paperChecks += 3;
            for (const t of types) {
              if (progress[progressKey(ch.id, t)]) paperDone++;
            }
          }

          return (
            <div key={paper.id} className="mb-6">
              <div
                className="flex items-center gap-2.5 mb-3 pb-2"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg2)' }}>
                  {paper.name}
                </h3>
                <span
                  className="text-[11px] tabular-nums ml-auto"
                  style={{ color: 'var(--fg3)' }}
                >
                  {paperDone}/{paperChecks} done
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {paper.chapters.map((ch, i) => (
                  <ChapterCard
                    key={ch.id}
                    chapterId={ch.id}
                    chapterName={ch.name}
                    idx={i}
                    theoryChecked={!!progress[progressKey(ch.id, 'theory')]}
                    cqChecked={!!progress[progressKey(ch.id, 'cq')]}
                    mcqChecked={!!progress[progressKey(ch.id, 'mcq')]}
                    onToggle={onToggle}
                  />
                ))}
                {paper.chapters.length === 0 && (
                  <p className="text-xs py-3" style={{ color: 'var(--fg3)' }}>
                    No chapters yet. Use "Add Chapter" or "Bulk Add" to add some.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function StatPill({ color, label }: { color: string; label: string }) {
  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tabular-nums"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface2)',
        color: 'var(--fg2)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

export const MainContent = memo(MainContentImpl);
