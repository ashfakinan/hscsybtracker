import { useState, useEffect, type ReactNode } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import type { Subject, ProgressMap, CheckType } from '@/lib/types';
import { progressKey } from '@/lib/data';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}

function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[480px] max-h-[90vh] flex flex-col overflow-hidden rounded-[14px]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 pt-[18px] pb-3.5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="text-base font-bold" style={{ color: 'var(--fg)' }}>
            {title}
          </h3>
          <button
            className="w-[30px] h-[30px] rounded-md flex items-center justify-center transition-colors"
            style={{ border: 'none', background: 'transparent', color: 'var(--fg3)' }}
            onClick={onClose}
            aria-label="Close"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface2)';
              e.currentTarget.style.color = 'var(--fg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--fg3)';
            }}
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        <div
          className="px-5 py-3 flex gap-2 justify-end"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

const COLOR_OPTIONS = [
  '#4f63d2', '#2da56e', '#e07b2a', '#9b3fd4',
  '#e05252', '#0ea5b5', '#d4a52a',
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1.5px solid var(--border)',
  background: 'var(--surface2)',
  color: 'var(--fg)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

// === Add Subject Modal ===
interface AddSubjectModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string, hasTwoPapers: boolean) => void;
}

export function AddSubjectModal({ open, onClose, onAdd }: AddSubjectModalProps) {
  const [name, setName] = useState('');
  const [hasTwoPapers, setHasTwoPapers] = useState(false);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (open) {
      setName('');
      setHasTwoPapers(false);
      setColor(COLOR_OPTIONS[0]);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Add Subject"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={() => { if (name.trim()) { onAdd(name.trim(), color, hasTwoPapers); onClose(); } }}>
            Add Subject
          </PrimaryButton>
        </>
      }
    >
      <FormGroup label="Subject Name">
        <input
          className="w-full"
          style={inputStyle}
          type="text"
          placeholder="e.g. Physics"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </FormGroup>
      <FormGroup label="Has Two Papers?">
        <div className="flex gap-2 mt-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-[13px]" style={{ color: 'var(--fg)' }}>
            <input
              type="radio"
              name="hasPapers"
              checked={hasTwoPapers}
              onChange={() => setHasTwoPapers(true)}
            />
            Yes (1st &amp; 2nd Paper)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[13px]" style={{ color: 'var(--fg)' }}>
            <input
              type="radio"
              name="hasPapers"
              checked={!hasTwoPapers}
              onChange={() => setHasTwoPapers(false)}
            />
            No (Single)
          </label>
        </div>
      </FormGroup>
      <FormGroup label="Color">
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded-full cursor-pointer transition-all"
              style={{
                background: c,
                border: color === c ? '2.5px solid var(--fg)' : '2.5px solid transparent',
              }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </FormGroup>
    </Modal>
  );
}

// === Rename Subject Modal ===
interface RenameSubjectModalProps {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSave: (subjectId: string, name: string, color: string) => void;
}

export function RenameSubjectModal({ open, subject, onClose, onSave }: RenameSubjectModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (open && subject) {
      setName(subject.name);
      setColor(subject.color || COLOR_OPTIONS[0]);
    }
  }, [open, subject]);

  if (!subject) return null;

  return (
    <Modal
      open={open}
      title="Rename Subject"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={() => { if (name.trim()) { onSave(subject.id, name.trim(), color); onClose(); } }}>
            Save Changes
          </PrimaryButton>
        </>
      }
    >
      <FormGroup label="Subject Name">
        <input
          style={inputStyle}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </FormGroup>
      <FormGroup label="Color">
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <div
              key={c}
              className="w-6 h-6 rounded-full cursor-pointer transition-all"
              style={{
                background: c,
                border: color === c ? '2.5px solid var(--fg)' : '2.5px solid transparent',
              }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </FormGroup>
    </Modal>
  );
}

// === Rename Chapter Modal ===
interface RenameChapterModalProps {
  open: boolean;
  chapter: { id: string; name: string } | null;
  onClose: () => void;
  onSave: (chapterId: string, name: string) => void;
}

export function RenameChapterModal({ open, chapter, onClose, onSave }: RenameChapterModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open && chapter) {
      setName(chapter.name);
    }
  }, [open, chapter]);

  if (!chapter) return null;

  return (
    <Modal
      open={open}
      title="Rename Chapter"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={() => { if (name.trim()) { onSave(chapter.id, name.trim()); onClose(); } }}>
            Save Changes
          </PrimaryButton>
        </>
      }
    >
      <FormGroup label="Chapter Name">
        <input
          style={inputStyle}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </FormGroup>
    </Modal>
  );
}

// === Export Progress Modal ===
interface ExportProgressModalProps {
  open: boolean;
  subjects: Subject[];
  progress: ProgressMap;
  onClose: () => void;
}

export function ExportProgressModal({ open, subjects, progress, onClose }: ExportProgressModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  let totalChecks = 0;
  let doneChecks = 0;
  const types: CheckType[] = ['theory', 'cq', 'mcq'];

  for (const subj of subjects) {
    for (const paper of subj.papers) {
      for (const ch of paper.chapters) {
        totalChecks += 3;
        for (const t of types) {
          if (progress[progressKey(ch.id, t)]) doneChecks++;
        }
      }
    }
  }

  const overallPct = totalChecks === 0 ? 0 : Math.round((doneChecks / totalChecks) * 100);

  const generateSummaryText = () => {
    let text = `HSC Study Progress Report (${overallPct}% Complete)\n`;
    text += `=====================================\n\n`;
    for (const subj of subjects) {
      text += `📘 ${subj.name}:\n`;
      for (const paper of subj.papers) {
        text += `  📄 ${paper.name}:\n`;
        for (const ch of paper.chapters) {
          const tDone = progress[progressKey(ch.id, 'theory')] ? '✓' : '○';
          const cDone = progress[progressKey(ch.id, 'cq')] ? '✓' : '○';
          const mDone = progress[progressKey(ch.id, 'mcq')] ? '✓' : '○';
          text += `    [T:${tDone} CQ:${cDone} MCQ:${mDone}] ${ch.name}\n`;
        }
      }
      text += `\n`;
    }
    return text;
  };

  const handleDownloadJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      overallProgressPct: overallPct,
      subjects,
      progress,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsc-syllabus-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    const summary = generateSummaryText();
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsc-study-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(generateSummaryText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Modal
      open={open}
      title="Export Study Progress"
      onClose={onClose}
      footer={
        <GhostButton onClick={onClose}>Close</GhostButton>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="p-3.5 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>Overall Completion</h4>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg3)' }}>{doneChecks} of {totalChecks} topics completed</p>
          </div>
          <span className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--accent)' }}>{overallPct}%</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Download size={14} />
            Download Complete Backup (.JSON)
          </button>
          <button
            onClick={handleDownloadText}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all hover:opacity-90"
            style={{ background: 'var(--surface2)', color: 'var(--fg)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <Download size={14} />
            Download Text Report (.TXT)
          </button>
          <button
            onClick={handleCopyClipboard}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all hover:opacity-90"
            style={{ background: 'var(--surface2)', color: 'var(--fg)', border: '1px solid var(--border)', cursor: 'pointer' }}
          >
            {copied ? <Check size={14} color="var(--theory)" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard!' : 'Copy Progress Summary to Clipboard'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// === Add Chapter Modal ===
interface AddChapterModalProps {
  open: boolean;
  subjects: Subject[];
  currentSubjectId: string | null;
  onClose: () => void;
  onAdd: (subjectId: string, paperId: string, name: string) => void;
}

export function AddChapterModal({ open, subjects, currentSubjectId, onClose, onAdd }: AddChapterModalProps) {
  const [subjectId, setSubjectId] = useState('');
  const [paperId, setPaperId] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      const sid = currentSubjectId || subjects[0]?.id || '';
      setSubjectId(sid);
      const subj = subjects.find((s) => s.id === sid);
      setPaperId(subj?.papers[0]?.id || '');
      setName('');
    }
  }, [open, currentSubjectId, subjects]);

  const subject = subjects.find((s) => s.id === subjectId);
  const papers = subject?.papers || [];

  return (
    <Modal
      open={open}
      title="Add Chapter"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => {
              if (name.trim() && subjectId && paperId) {
                onAdd(subjectId, paperId, name.trim());
                onClose();
              }
            }}
          >
            Add Chapter
          </PrimaryButton>
        </>
      }
    >
      <FormGroup label="Subject">
        <select
          style={inputStyle}
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            const s = subjects.find((su) => su.id === e.target.value);
            setPaperId(s?.papers[0]?.id || '');
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </FormGroup>
      {papers.length > 1 && (
        <FormGroup label="Paper">
          <select style={inputStyle} value={paperId} onChange={(e) => setPaperId(e.target.value)}>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </FormGroup>
      )}
      <FormGroup label="Chapter Name">
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. ভৌতজগৎ ও পরিমাপ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </FormGroup>
    </Modal>
  );
}

// === Bulk Add Modal ===
interface BulkAddModalProps {
  open: boolean;
  subjects: Subject[];
  currentSubjectId: string | null;
  onClose: () => void;
  onAdd: (subjectId: string, paperId: string, chapters: string[]) => void;
}

export function BulkAddModal({ open, subjects, currentSubjectId, onClose, onAdd }: BulkAddModalProps) {
  const [subjectId, setSubjectId] = useState('');
  const [paperId, setPaperId] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (open) {
      const sid = currentSubjectId || subjects[0]?.id || '';
      setSubjectId(sid);
      const subj = subjects.find((s) => s.id === sid);
      setPaperId(subj?.papers[0]?.id || '');
      setText('');
    }
  }, [open, currentSubjectId, subjects]);

  const subject = subjects.find((s) => s.id === subjectId);
  const papers = subject?.papers || [];

  return (
    <Modal
      open={open}
      title="Bulk Add Chapters"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton
            onClick={() => {
              const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
              if (lines.length && subjectId && paperId) {
                onAdd(subjectId, paperId, lines);
                onClose();
              }
            }}
          >
            Add Chapters
          </PrimaryButton>
        </>
      }
    >
      <FormGroup label="Subject">
        <select
          style={inputStyle}
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            const s = subjects.find((su) => su.id === e.target.value);
            setPaperId(s?.papers[0]?.id || '');
          }}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </FormGroup>
      {papers.length > 1 && (
        <FormGroup label="Paper">
          <select style={inputStyle} value={paperId} onChange={(e) => setPaperId(e.target.value)}>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </FormGroup>
      )}
      <FormGroup label="Chapters (one per line)">
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          rows={6}
          placeholder={'ভৌতজগৎ ও পরিমাপ\nভেষ্টর\nগতিবিদ্যা\nনিউটনীয় বলবিদ্যা'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <p className="text-[11px] mt-1" style={{ color: 'var(--fg3)' }}>
          Each line becomes one chapter. Empty lines are ignored.
        </p>
      </FormGroup>
    </Modal>
  );
}

function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: 'var(--fg2)', letterSpacing: '0.03em' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all hover:opacity-90"
      style={{ border: 'none', background: 'var(--accent)', color: '#fff' }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
      style={{ background: 'var(--surface2)', color: 'var(--fg2)', border: '1px solid var(--border)' }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface2)';
      }}
    >
      {children}
    </button>
  );
}
