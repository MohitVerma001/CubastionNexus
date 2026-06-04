export const MOCK_TICKETS = [
  { id: 't-001', ticket_number: 'CUB-00142', subject: 'ログイン画面でエラーが発生しています', organisation: { name: 'Fujikura Ltd.' }, priority: 'P1', status: 'escalated', assigned_to: { name: 'Yamamoto K.' }, sla_resolution_due: new Date(Date.now() + 2 * 3600000).toISOString(), updated_at: new Date(Date.now() - 30 * 60000).toISOString(), category: 'system_issue' },
  { id: 't-002', ticket_number: 'CUB-00141', subject: 'データエクスポート機能が動作しない', organisation: { name: 'Sumitomo Corp.' }, priority: 'P2', status: 'in_progress', assigned_to: { name: 'Nakamura A.' }, sla_resolution_due: new Date(Date.now() + 12 * 3600000).toISOString(), updated_at: new Date(Date.now() - 2 * 3600000).toISOString(), category: 'functional_issue' },
  { id: 't-003', ticket_number: 'CUB-00140', subject: 'ユーザー権限の設定について質問があります', organisation: { name: 'Panasonic Ltd.' }, priority: 'P3', status: 'pending_customer', assigned_to: null, sla_resolution_due: new Date(Date.now() + 48 * 3600000).toISOString(), updated_at: new Date(Date.now() - 5 * 3600000).toISOString(), category: 'user_management' },
  { id: 't-004', ticket_number: 'CUB-00139', subject: 'レポート生成に時間がかかりすぎる', organisation: { name: 'Toyota Systems' }, priority: 'P2', status: 'open', assigned_to: { name: 'Suzuki M.' }, sla_resolution_due: new Date(Date.now() + 8 * 3600000).toISOString(), updated_at: new Date(Date.now() - 1 * 3600000).toISOString(), category: 'system_issue' },
  { id: 't-005', ticket_number: 'CUB-00138', subject: 'バックアップデータの復元方法について', organisation: { name: 'Fujikura Ltd.' }, priority: 'P3', status: 'closed', assigned_to: { name: 'Yamamoto K.' }, sla_resolution_due: new Date(Date.now() - 24 * 3600000).toISOString(), updated_at: new Date(Date.now() - 24 * 3600000).toISOString(), category: 'data_issue' },
  { id: 't-006', ticket_number: 'CUB-00137', subject: 'API連携の認証トークンが期限切れになる', organisation: { name: 'Hitachi Group' }, priority: 'P1', status: 'in_progress', assigned_to: { name: 'Nakamura A.' }, sla_resolution_due: new Date(Date.now() + 1 * 3600000).toISOString(), updated_at: new Date(Date.now() - 45 * 60000).toISOString(), category: 'system_issue' },
  { id: 't-007', ticket_number: 'CUB-00136', subject: 'メール通知が届かない問題', organisation: { name: 'Sumitomo Corp.' }, priority: 'P2', status: 'open', assigned_to: null, sla_resolution_due: new Date(Date.now() + 6 * 3600000).toISOString(), updated_at: new Date(Date.now() - 3 * 3600000).toISOString(), category: 'functional_issue' },
  { id: 't-008', ticket_number: 'CUB-00135', subject: 'ダッシュボードの表示が崩れる', organisation: { name: 'Panasonic Ltd.' }, priority: 'P3', status: 'open', assigned_to: { name: 'Suzuki M.' }, sla_resolution_due: new Date(Date.now() - 2 * 3600000).toISOString(), updated_at: new Date(Date.now() - 6 * 3600000).toISOString(), category: 'functional_issue' },
];

export const MOCK_ORGANISATIONS = [
  { id: 'org-001', name: 'Fujikura Ltd.', primary_contact: 'Tanaka Hiroshi', email: 'support@fujikura.co.jp', ticket_count: 12, open_count: 3, is_active: true, created_at: '2025-01-15T09:00:00Z' },
  { id: 'org-002', name: 'Sumitomo Corp.', primary_contact: 'Kato Yuki', email: 'it-support@sumitomo.co.jp', ticket_count: 8, open_count: 2, is_active: true, created_at: '2025-02-20T09:00:00Z' },
  { id: 'org-003', name: 'Panasonic Ltd.', primary_contact: 'Ito Masako', email: 'helpdesk@panasonic.co.jp', ticket_count: 15, open_count: 5, is_active: true, created_at: '2025-01-10T09:00:00Z' },
  { id: 'org-004', name: 'Toyota Systems', primary_contact: 'Watanabe Jiro', email: 'systems-support@toyota.co.jp', ticket_count: 6, open_count: 1, is_active: true, created_at: '2025-03-05T09:00:00Z' },
  { id: 'org-005', name: 'Hitachi Group', primary_contact: 'Kobayashi Ren', email: 'tech-support@hitachi.co.jp', ticket_count: 10, open_count: 4, is_active: false, created_at: '2025-01-25T09:00:00Z' },
];

export const MOCK_USERS = [
  { id: 'u-001', name: 'Tanaka Hiroshi', email: 'tanaka@fujikura.co.jp', role: 'customer', organisation: { name: 'Fujikura Ltd.' }, is_active: true, last_login_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'u-002', name: 'Yamamoto Kenji', email: 'yamamoto@cubastion.com', role: 'agent', organisation: null, is_active: true, last_login_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'u-003', name: 'Suzuki Akiko', email: 'suzuki@cubastion.com', role: 'admin', organisation: null, is_active: true, last_login_at: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 'u-004', name: 'Kato Yuki', email: 'kato@sumitomo.co.jp', role: 'customer', organisation: { name: 'Sumitomo Corp.' }, is_active: true, last_login_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'u-005', name: 'Nakamura Aiko', email: 'nakamura@cubastion.com', role: 'agent', organisation: null, is_active: true, last_login_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'u-006', name: 'Ito Masako', email: 'ito@panasonic.co.jp', role: 'customer', organisation: { name: 'Panasonic Ltd.' }, is_active: false, last_login_at: new Date(Date.now() - 72 * 3600000).toISOString() },
];

export const MOCK_COMMENTS = [
  { id: 'c-001', author: { name: 'Tanaka Hiroshi', role: 'customer' }, body: 'ログイン画面でエラーコード 500 が表示されます。社内の複数のPCで同じ問題が発生しており、業務に支障が出ています。至急ご対応をお願いします。', is_internal: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString(), source: 'portal' },
  { id: 'c-002', author: { name: 'Yamamoto Kenji', role: 'agent' }, body: 'ご連絡ありがとうございます。問題を確認しました。サーバーログを確認したところ、認証サービスに問題が発生していることがわかりました。現在対応中です。', is_internal: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString(), source: 'portal' },
  { id: 'c-003', author: { name: 'Yamamoto Kenji', role: 'agent' }, body: 'Internal: Auth service restart scheduled in 15min. Need to notify Tanaka-san.', is_internal: true, created_at: new Date(Date.now() - 1.5 * 3600000).toISOString(), source: 'portal' },
  { id: 'c-004', author: { name: 'Tanaka Hiroshi', role: 'customer' }, body: '確認しました。引き続きよろしくお願いします。', is_internal: false, created_at: new Date(Date.now() - 1 * 3600000).toISOString(), source: 'portal' },
];

export const MOCK_SLA_CONFIGS = [
  { id: 's-001', priority: 'P1', label: 'Critical', first_response_hours: 1, resolution_hours: 4, updated_at: '2026-01-15T09:00:00Z' },
  { id: 's-002', priority: 'P2', label: 'High', first_response_hours: 4, resolution_hours: 16, updated_at: '2026-01-15T09:00:00Z' },
  { id: 's-003', priority: 'P3', label: 'Normal', first_response_hours: 8, resolution_hours: 40, updated_at: '2026-01-15T09:00:00Z' },
];

export const MOCK_AUDIT_LOGS = [
  { id: 'a-001', ticket_number: 'CUB-00142', action: 'status_changed', actor: 'Yamamoto Kenji', old_value: 'open', new_value: 'escalated', created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'a-002', ticket_number: 'CUB-00141', action: 'assigned', actor: 'Suzuki Akiko', old_value: null, new_value: 'Nakamura Aiko', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'a-003', ticket_number: 'CUB-00140', action: 'priority_changed', actor: 'Yamamoto Kenji', old_value: 'P2', new_value: 'P3', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'a-004', ticket_number: 'CUB-00138', action: 'closed', actor: 'Yamamoto Kenji', old_value: 'in_progress', new_value: 'closed', created_at: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'a-005', ticket_number: 'CUB-00137', action: 'comment_added', actor: 'Tanaka Hiroshi', old_value: null, new_value: 'Customer replied via portal', created_at: new Date(Date.now() - 48 * 3600000).toISOString() },
];
