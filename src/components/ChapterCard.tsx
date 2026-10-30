import { memo } from 'react';
import { Check, Edit2, BookOpen } from 'lucide-react';
import type { CheckType } from '@/lib/types';

interface ChapterCardProps {
  chapterId: string;
  chapterName: string;
  idx: number;
  theoryChecked: boolean;
  cqChecked: boolean;
  mcqChecked: boolean;
  studyingChecked: boolean;
  onToggle: (chapterId: string, type: CheckType, checked: boolean) => void;
  onRename?: (chapterId: string, currentName: string) => void;
}

const CHECK_TYPES: CheckType[] = ['theory', 'cq', 'mcq'];
const TYPE_LABELS: Record<CheckType, string> = { theory: 'Theory', cq: 'CQ', mcq: 'MCQ' };
const TYPE_COLORS: Record<CheckType, string> = {
  theory: 'var(--theory)',
  cq: 'var(--cq)',
  mcq: 'var(--mcq)',
};
const TYPE_LIGHT: Record<CheckType, string> = {
  theory: 'var(--theory-light)',
  cq: 'var(--cq-light)',
  mcq: 'var(--mcq-light)',
};

function ChapterCardImpl({
  chapterId,
  chapterName,
  idx,
  theoryChecked,
  cqChecked,
  mcqChecked,
  studyingChecked,
  onToggle,
  onRename,
}: ChapterCardProps) {
  const checkedMap: Record<CheckType, boolean> = {
    theory: theoryChecked,
    cq: cqChecked,
    mcq: mcqChecked,
  };
  const allDone = theoryChecked && cqChecked && mcqChecked;

  return (
    <div
      className="rounded-[10px] px-3.5 py-3 transition-colors group"
      style={{
        background: studyingChecked ? 'var(--accent-light)' : allDone ? 'var(--done-bg)' : 'var(--surface)',
        border: `1.5px solid ${studyingChecked ? 'var(--accent)' : allDone ? 'var(--theory)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="text-[11px] font-bold tabular-nums rounded-[5px] px-1.5 py-0.5 flex-shrink-0 mt-px"
          style={{ background: 'var(--surface2)', color: 'var(--fg3)' }}
        >
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span
          className="text-sm font-medium flex-1"
          style={{
            color: 'var(--fg)',
            fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif",
          }}
        >
          {chapterName}
        </span>
        {onRename && (
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface2"
            style={{ border: 'none', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer' }}
            onClick={() => onRename(chapterId, chapterName)}
            title="Rename Chapter"
          >
            <Edit2 size={13} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-between">
        <button
          type="button"
          className="check-btn flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-full text-[12px] font-semibold transition-all select-none"
          style={{
            border: `1.5px solid ${studyingChecked ? 'var(--accent)' : 'var(--border)'}`,
            background: studyingChecked ? 'var(--accent)' : 'var(--surface)',
            color: studyingChecked ? '#fff' : 'var(--fg2)',
          }}
          onClick={() => onToggle(chapterId, 'studying', !studyingChecked)}
        >
          <BookOpen size={13} />
          {studyingChecked ? 'Currently Studying (Done?)' : 'Mark Studying'}
        </button>

        <div className="flex gap-2 flex-wrap">
          {CHECK_TYPES.map((type) => {
            const checked = checkedMap[type];
            return (
              <button
                key={type}
                type="button"
                className="check-btn flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-full text-[12px] font-medium transition-all select-none"
                style={{
                  border: `1.5px solid ${checked ? TYPE_COLORS[type] : 'var(--border)'}`,
                  background: checked ? TYPE_LIGHT[type] : 'var(--surface)',
                  color: checked ? TYPE_COLORS[type] : 'var(--fg)',
                }}
                onClick={() => onToggle(chapterId, type, !checked)}
              >
                <span
                  className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: checked ? TYPE_COLORS[type] : 'transparent',
                    border: `1.5px solid ${checked ? TYPE_COLORS[type] : 'var(--border)'}`,
                  }}
                >
                  {checked && <Check size={10} color="#fff" strokeWidth={2.5} />}
                </span>
                {TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const ChapterCard = memo(ChapterCardImpl);
