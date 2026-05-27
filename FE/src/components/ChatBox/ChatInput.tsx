import React, { useState, useCallback, KeyboardEvent, useRef } from 'react';

// ─── Accepted MIME types ──────────────────────────────────────────────────────
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ACCEPT_ATTR = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.gif';
const MAX_SIZE_MB = 20;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileKind(mimeType: string): 'image' | 'pdf' | 'doc' | 'txt' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  return 'txt';
}

const FILE_COLORS: Record<string, string> = {
  image: '#10b981',
  pdf: '#ef4444',
  doc: '#3b82f6',
  txt: '#f59e0b',
};

const FILE_LABELS: Record<string, string> = {
  image: 'Ảnh',
  pdf: 'PDF',
  doc: 'DOCX',
  txt: 'TXT',
};

// SVG icons
const AttachIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    width="17" height="17">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

interface ChatInputProps {
  onSend: (message: string, file?: File | null) => void;
  disabled?: boolean;
  placeholder?: string;
  primaryColor?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Nhắn tin...',
  primaryColor = '#6366f1',
}) => {
  const [value, setValue] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !disabled && (value.trim().length > 0 || attachedFile !== null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '20px'; // Set to baseline single line height to prevent collapsible layout jitter
    el.style.height = Math.min(el.scrollHeight - 17, 120) + 'px';
  };

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSend(value.trim(), attachedFile);
    setValue('');
    setAttachedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Reset textarea height to baseline
    if (textareaRef.current) {
      textareaRef.current.style.height = '20px';
    }
  }, [value, attachedFile, canSend, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Định dạng không hỗ trợ. Chỉ chấp nhận PDF, DOCX, TXT, JPG, PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File quá lớn. Tối đa ${MAX_SIZE_MB}MB.`);
      return;
    }
    setAttachedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileKind = attachedFile ? getFileKind(attachedFile.type) : null;
  const fileColor = fileKind ? FILE_COLORS[fileKind] : '#6366f1';
  const fileLabel = fileKind ? FILE_LABELS[fileKind] : 'FILE';

  return (
    <div
      className="acp-chat-input-container"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', position: 'relative' }}
    >
      {/* ── Drag overlay hint ── */}
      {isDragOver && (
        <div className="acp-drag-overlay">
          <span>📎 Thả file vào đây</span>
        </div>
      )}

      {/* ── Attached file chip (Floats above the input capsule) ── */}
      {attachedFile && (
        <div className="acp-file-chip" style={{ '--chip-color': fileColor } as React.CSSProperties}>
          <div className="acp-file-chip__badge" style={{ background: fileColor }}>
            {fileLabel}
          </div>
          <span className="acp-file-chip__name" title={attachedFile.name}>
            {attachedFile.name}
          </span>
          <span className="acp-file-chip__size">{formatSize(attachedFile.size)}</span>
          <button
            className="acp-file-chip__remove"
            onClick={removeFile}
            type="button"
            aria-label="Xóa file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="12" height="12">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── File error (Floats above the input capsule) ── */}
      {fileError && (
        <div className="acp-file-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          {fileError}
        </div>
      )}

      {/* ── Main input bar capsule (Bo tròn 16px, bọc ONLY các thành phần nhập liệu) ── */}
      <div className={`acp-input-wrapper${isDragOver ? ' acp-input-wrapper--drag' : ''}`}>
        <div className="acp-input-bar">
          {/* Attach button */}
          <button
            className="acp-input-bar__attach"
            onClick={() => !disabled && fileInputRef.current?.click()}
            disabled={disabled}
            type="button"
            title="Đính kèm file (PDF, DOCX, TXT, Ảnh — tối đa 20MB)"
            aria-label="Đính kèm tệp"
          >
            <AttachIcon />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <textarea
            ref={textareaRef}
            className="acp-input-bar__textarea"
            value={value}
            onChange={(e) => { setValue(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'AI đang trả lời...' : placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Nhập tin nhắn"
          />

          {/* Send button */}
          <button
            className={`acp-input-bar__send${canSend ? ' acp-input-bar__send--active' : ''}`}
            style={canSend ? { background: primaryColor } : undefined}
            onClick={handleSend}
            disabled={!canSend}
            type="button"
            aria-label="Gửi tin nhắn"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
