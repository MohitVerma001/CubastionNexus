import { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'text/x-log', 'application/zip', 'application/x-zip-compressed'];
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.pdf', '.txt', '.log', '.zip'];
const MAX_BYTES = 10 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const typeOk = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.includes(ext);
  if (!typeOk) return 'Unsupported file type';
  if (file.size > MAX_BYTES) return 'File exceeds 10MB limit';
  return null;
}

export default function AttachmentUploader({ onFilesChange, disabled }) {
  const [validFiles, setValidFiles] = useState([]);
  const [invalidFiles, setInvalidFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = (incoming) => {
    const valid = [];
    const invalid = [];
    Array.from(incoming).forEach(file => {
      const error = validateFile(file);
      if (error) invalid.push({ name: file.name, error });
      else valid.push(file);
    });

    const merged = [...validFiles];
    valid.forEach(f => {
      if (!merged.find(v => v.name === f.name && v.size === f.size)) merged.push(f);
    });

    setValidFiles(merged);
    setInvalidFiles(invalid);
    onFilesChange(merged);
  };

  const removeFile = (index) => {
    const updated = validFiles.filter((_, i) => i !== index);
    setValidFiles(updated);
    onFilesChange(updated);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${dragging
            ? 'border-[#01516A] bg-[#EBF5FA]'
            : 'border-[#E0E2E6] bg-[#F9FAFB] hover:border-[#01516A] hover:bg-[#EBF5FA]'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXT.join(',')}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <Upload className="w-8 h-8 text-[#999] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#0F0F0F]">Drag files here or click to browse</p>
        <p className="text-xs text-[#707070] mt-1">JPG, PNG, PDF, TXT, LOG, ZIP — max 10MB each</p>
      </div>

      {(validFiles.length > 0 || invalidFiles.length > 0) && (
        <ul className="mt-3 space-y-1.5">
          {validFiles.map((file, i) => (
            <li key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-[#E0E2E6] rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-4 h-4 text-[#01516A] shrink-0" />
                <span className="text-sm text-[#0F0F0F] truncate">{file.name}</span>
                <span className="text-xs text-[#707070] shrink-0">{formatSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={disabled}
                className="ml-2 p-1 rounded hover:bg-[#EBEBEB] text-[#707070] hover:text-[#C81E1E] transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
          {invalidFiles.map((f, i) => (
            <li key={i} className="flex items-center gap-2 px-3 py-2 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg">
              <X className="w-4 h-4 text-[#C81E1E] shrink-0" />
              <span className="text-sm text-[#C81E1E] truncate">{f.name}</span>
              <span className="text-xs text-[#C81E1E] shrink-0">— {f.error}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
