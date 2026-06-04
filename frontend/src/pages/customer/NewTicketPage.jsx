import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, X, Upload } from 'lucide-react';
import { TICKET_CATEGORIES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';

const FIELD = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">
      {label} {required && <span className="text-[#C81E1E]">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-[#999] mt-1">{hint}</p>}
  </div>
);

export default function NewTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', category: '', priority: 'P3', description: '' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.description.trim()) e.description = 'Please describe the issue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    navigate('/customer');
  };

  const handleFile = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/customer')} className="flex items-center gap-1.5 text-sm text-[#707070] hover:text-[#01516A] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <PageHeader
        title="Submit Support Ticket"
        subtitle="Describe your issue and our team will respond promptly."
        breadcrumbs={['Portal', 'New Ticket']}
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-[#E8EAED] p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {/* Organization (read-only for customers) */}
          <FIELD label="Organization">
            <div className="px-3.5 py-2.5 bg-[#F5F6F8] border border-[#E0E2E6] rounded-lg text-sm text-[#5C5C5C]">
              {user?.organisation?.name || 'Your organization'}
            </div>
          </FIELD>

          <FIELD label="Subject" required>
            <input
              type="text"
              value={form.subject}
              onChange={e => update('subject', e.target.value)}
              placeholder="Brief summary of the issue"
              maxLength={120}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${errors.subject ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
            />
            {errors.subject && <p className="text-xs text-[#C81E1E] mt-1">{errors.subject}</p>}
            <p className="text-xs text-[#999] mt-1">{form.subject.length}/120</p>
          </FIELD>

          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Category" required>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors ${errors.category ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
              >
                <option value="">Select category</option>
                {TICKET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-[#C81E1E] mt-1">{errors.category}</p>}
            </FIELD>

            <FIELD label="Priority" hint="P1 = Critical business impact">
              <select
                value={form.priority}
                onChange={e => update('priority', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors"
              >
                <option value="P3">P3 — Normal</option>
                <option value="P2">P2 — High</option>
                <option value="P1">P1 — Critical</option>
              </select>
            </FIELD>
          </div>

          <FIELD label="Description" required>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={6}
              placeholder="Please provide a detailed description of the issue, including steps to reproduce, error messages, and business impact."
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] resize-none transition-colors ${errors.description ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
            />
            {errors.description && <p className="text-xs text-[#C81E1E] mt-1">{errors.description}</p>}
          </FIELD>

          {/* Attachments */}
          <FIELD label="Attachments" hint="Max 10MB per file. PDF, images, text, ZIP supported.">
            <label className="flex flex-col items-center justify-center gap-2 px-6 py-5 border-2 border-dashed border-[#D3ECFB] rounded-xl hover:border-[#01516A] cursor-pointer transition-colors bg-[#F9FDFF] hover:bg-[#EBF5FA]">
              <Upload className="w-5 h-5 text-[#609CB8]" />
              <span className="text-sm text-[#609CB8] font-medium">Click to attach files</span>
              <input type="file" multiple className="hidden" onChange={handleFile} />
            </label>
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#F5F6F8] rounded-lg">
                    <Paperclip className="w-3.5 h-3.5 text-[#999]" />
                    <span className="text-xs text-[#5C5C5C] flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-[#999]">{(f.size / 1024).toFixed(0)}KB</span>
                    <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="text-[#999] hover:text-[#C81E1E] transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FIELD>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="secondary" type="button" onClick={() => navigate('/customer')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Submit Ticket</Button>
        </div>
      </form>
    </div>
  );
}
