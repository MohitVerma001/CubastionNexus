import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { TICKET_CATEGORIES, PRIORITY_LABELS } from '../../utils/constants';
import { validateTicketForm } from '../../utils/validators';
import { createTicket } from '../../services/tickets.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import AttachmentUploader from '../../components/tickets/AttachmentUploader';

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
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { subject: '', category: '', priority: 'P3', description: '' },
  });

  const subjectValue = watch('subject');

  const onSubmit = async (data) => {
    const { valid, errors: validationErrors } = validateTicketForm(data);
    if (!valid) {
      // react-hook-form already handles field errors via register; surface generic fallback
      setApiError(Object.values(validationErrors)[0] || 'Please correct the errors above.');
      return;
    }
    setApiError('');
    setSubmitting(true);
    try {
      await createTicket({ ...data, attachments: files });
      addToast('Your ticket has been submitted successfully.', 'success');
      navigate('/customer');
    } catch (err) {
      setApiError(err?.response?.data?.message || err?.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

      <form onSubmit={handleSubmit(onSubmit)}>
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
            {apiError}
          </div>
        )}

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
              placeholder="Brief summary of the issue"
              maxLength={120}
              {...register('subject', { required: 'Subject is required.', maxLength: { value: 120, message: 'Subject cannot exceed 120 characters.' } })}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${errors.subject ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
            />
            {errors.subject && <p className="text-xs text-[#C81E1E] mt-1">{errors.subject.message}</p>}
            <p className="text-xs text-[#999] mt-1">{(subjectValue || '').length}/120</p>
          </FIELD>

          <div className="grid grid-cols-2 gap-4">
            <FIELD label="Category" required>
              <select
                {...register('category', { required: 'Category is required.' })}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors ${errors.category ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
              >
                <option value="">Select category</option>
                {TICKET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-[#C81E1E] mt-1">{errors.category.message}</p>}
            </FIELD>

            <FIELD label="Priority" hint="P1 = Critical business impact">
              <select
                {...register('priority')}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors"
              >
                <option value="P3">{PRIORITY_LABELS.P3}</option>
                <option value="P2">{PRIORITY_LABELS.P2}</option>
                <option value="P1">{PRIORITY_LABELS.P1}</option>
              </select>
            </FIELD>
          </div>

          <FIELD label="Description" required>
            <textarea
              rows={6}
              placeholder="Please provide a detailed description of the issue, including steps to reproduce, error messages, and business impact."
              {...register('description', { required: 'Description is required.', maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters.' } })}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] resize-none transition-colors ${errors.description ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
            />
            {errors.description && <p className="text-xs text-[#C81E1E] mt-1">{errors.description.message}</p>}
          </FIELD>

          <FIELD label="Attachments" hint="Max 10MB per file. PDF, images, text, ZIP supported.">
            <AttachmentUploader onFilesChange={setFiles} disabled={submitting} />
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
