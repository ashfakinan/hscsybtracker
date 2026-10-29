import { memo } from 'react';
import { Plus, List, Layers, LogOut } from 'lucide-react';
import type { Subject, ProgressMap, CheckType } from '@/lib/types';
import { progressKey } from '@/lib/data';

interface SidebarProps {
  subjects: Subject[];
  progress: ProgressMap;
  currentSubjectId: string | null;
  onSelectSubject: (id: string) => void;
  onAddSubject: () => void;
  onAddChapter: () => void;
  onBulkAdd: () => void;
  onSignOut: () => void;
}

function subjectCompletionPct(subject: Subject, progress: ProgressMap): number {
  let total = 0;
  let done = 0;
  const types: CheckType[] = ['theory', 'cq', 'mcq'];
  for (const paper of subject.papers) {
    for (const ch of paper.chapters) {
      total += 3;
      for (const t of types) {
        if (progress[progressKey(ch.id, t)]) done++;
      }
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function overallPct(subjects: Subject[], progress: ProgressMap): number {
  let total = 0;
  let done = 0;
  const types: CheckType[] = ['theory', 'cq', 'mcq'];
  for (const subj of subjects) {
    for (const paper of subj.papers) {
      for (const ch of paper.chapters) {
        total += 3;
        for (const t of types) {
          if (progress[progressKey(ch.id, t)]) done++;
        }
      }
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function SidebarImpl({
  subjects,
  progress,
  currentSubjectId,
  onSelectSubject,
  onAddSubject,
  onAddChapter,
  onBulkAdd,
  onSignOut,
}: SidebarProps) {
  const pct = overallPct(subjects, progress);

  return (
    <aside
      className="sidebar-inner flex flex-col overflow-hidden"
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <div className="px-[14px] pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1
          className="text-[13px] font-bold uppercase"
          style={{ color: 'var(--accent)', letterSpacing: '0.06em' }}
        >
          HSC Tracker
        </h1>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--fg3)' }}>
          2026–2027 Syllabus
        </p>
      </div>

      <div className="px-[14px] py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex justify-between text-[11px] mb-1" style={{ color: 'var(--fg3)' }}>
          <span>Overall Progress</span>
          <span>{pct}%</span>
        </div>
        <div
          className="h-[5px] rounded-full overflow-hidden"
          style={{ background: 'var(--surface2)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: 'var(--accent)' }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-1.5 py-2">
        {subjects.map((subj) => {
          const sPct = subjectCompletionPct(subj, progress);
          const active = subj.id === currentSubjectId;
          return (
            <div
              key={subj.id}
              className={`nav-item flex items-center gap-2 px-2.5 py-2 rounded-[10px] cursor-pointer mb-0.5 transition-colors ${active ? 'nav-item-active' : ''}`}
              onClick={() => onSelectSubject(subj.id)}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: subj.color }}
              />
              <span
                className="text-[13px] flex-1"
                style={{
                  color: active ? 'var(--accent)' : 'var(--fg)',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {subj.name}
              </span>
              <span
                className="text-[11px] tabular-nums"
                style={{ color: 'var(--fg3)' }}
              >
                {sPct}%
              </span>
            </div>
          );
        })}
      </nav>

      <div
        className="px-2 py-2.5 flex flex-col gap-1"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <SidebarButton icon={<Plus size={14} />} label="Add Subject" onClick={onAddSubject} />
        <SidebarButton icon={<List size={14} />} label="Add Chapter" onClick={onAddChapter} />
        <SidebarButton icon={<Layers size={14} />} label="Bulk Add" onClick={onBulkAdd} />
        <SidebarButton icon={<LogOut size={14} />} label="Sign Out" onClick={onSignOut} />
      </div>
    </aside>
  );
}

function SidebarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="sidebar-btn flex items-center gap-1.5 px-2.5 py-[7px] rounded-lg text-[12px] text-left w-full transition-colors"
      style={{ border: 'none', background: 'transparent', color: 'var(--fg2)' }}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

export const Sidebar = memo(SidebarImpl);
