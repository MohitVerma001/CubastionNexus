import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { TICKET_CATEGORIES, PRIORITY_LABELS } from '../../utils/constants';
import { createTicket, uploadAttachment } from '../../services/tickets.service';
import { getOrganisations } from '../../services/organisations.service';
import { getUsers } from '../../services/users.service';
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

export default function AgentNewTicketPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [organisations, setOrganisations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { subject: '', category: '', priority: 'P3', description: '', customer_id: '' },
  });

  const subjectValue = watch('subject');

  useEffect(() => {
    getOrganisations()
      .then(data => setOrganisations(data.organisations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedOrgId) { setCustomers([]); return; }
    getUsers({ role: 'customer', organisation_id: selectedOrgId, is_active: true })
      .then(data => setCustomers(data.data || data.users || []))
      .catch(() => setCustomers([]));
  }, [selectedOrgId]);

  const onSubmit = async (data) => {
    if (!selectedOrgId) {
      setApiError('Please select an organisation.');
      return;
    }
    setApiError('');
    setSubmitting(true);
    try {
      const ticket = await createTicket({
        subject:          data.subject,
        description:      data.description,
        category:         data.category,
        priority:         data.priority,
        organisation_id:  selectedOrgId,
        submitted_by_id:  data.customer_id || undefined,
      });

      if (files.length) {
        await Promise.all(files.map(f => uploadAttachment(ticket.ticket?.id || ticket.id, f)));
      }

      addToast('Ticket created successfully.', 'success');
      navigate(`/agent/tickets/${ticket.ticket?.id || ticket.id}`);
    } catch (err) {
      setApiError(err?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/agent/tickets')} className="flex items-center gap-1.5 text-sm text-[#707070] hover:text-[#01516A] transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />Back
      </button>

      <PageHeader
        title="Create Ticket on Behalf of Customer"
        subtitle="Submit a support ticket for a customer user."
        breadcrumbs={['Agent Portal', 'Tickets', 'New']}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
            {apiError}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E8EAED] p-6 space-y-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <FIELD label="Organisation" required>
            <select
              value={selectedOrgId}
              onChange={e => setSelectedOrgId(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors ${!selectedOrgId && submitting ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
            >
              <option value="">Select organisation</option>
              {organisations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </FIELD>

          {selectedOrgId && (
            <FIELD label="Customer" required hint="The customer this ticket is being raised for.">
              <select
                {...register('customer_id', { required: 'Please select a customer.' })}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] transition-colors ${errors.customer_id ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
              >
                <option value="">Select customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
              {errors.customer_id && <p className="text-xs text-[#C81E1E] mt-1">{errors.customer_id.message}</p>}
            </FIELD>
          )}

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
          <Button variant="secondary" type="button" onClick={() => navigate('/agent/tickets')}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Ticket</Button>
        </div>
      </form>
    </div>
  );
}
