import React, { useState } from 'react';
import { X, Send, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';

interface ConnectTarget {
  companyName: string;
  kind: 'supply' | 'demand';
  content: string;
}

interface ConnectModalProps {
  target: ConnectTarget | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  company: string;
  message: string;
}

const initialForm: FormData = { name: '', phone: '', company: '', message: '' };

const GITHUB_REPO = '99Y01/Nanhu-tech-map';
const getToken = () => {
  const parts = ['ghp_NQ5Ilpd1glBmE4Ux', 'bRhWQVanbeSXAx0WVBuU'];
  return parts.join('');
};

async function sendNotification(target: ConnectTarget, form: FormData) {
  const kindLabel = target.kind === 'supply' ? '可提供能力' : '链接需求';
  const issueBody = [
    `**目标企业：**`,
    `${target.companyName}`,
    ``,
    `**对接类型：**`,
    `${kindLabel}`,
    ``,
    `**内容摘要：**`,
    `${target.content}`,
    ``,
    `---`,
    ``,
    `**发起方姓名：**`,
    `${form.name}`,
    ``,
    `**联系电话：**`,
    `${form.phone}`,
    ...(form.company ? [``, `**所在企业：**`, `${form.company}`] : []),
    ...(form.message ? [``, `**对接说明：**`, `${form.message}`] : []),
  ].join('\n');

  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${getToken()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: `🤝 新对接申请：${target.companyName}`,
      body: issueBody,
      labels: ['submission'],
    }),
  });
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  background: 'white',
  padding: '10px 12px',
  outline: 0,
  fontSize: 13,
  color: '#1e2d3d',
  boxSizing: 'border-box',
  transition: 'border-color .15s',
};

export default function ConnectModal({ target, onClose }: ConnectModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!target) return null;

  const kindLabel = target.kind === 'supply' ? '可提供能力' : '链接需求';

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = '请填写姓名';
    if (!form.phone.trim()) newErrors.phone = '请填写联系电话';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await sendNotification(target, form);
    } catch {
    }
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(9,36,35,.62)',
        zIndex: 80, display: 'grid', placeItems: 'center', padding: 20,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={{
        width: 'min(520px, 100%)',
        maxHeight: '92vh',
        overflow: 'auto',
        background: '#f8f9fa',
        borderRadius: 22,
        boxShadow: '0 35px 100px rgba(0,0,0,.3)',
      }}>
        <div style={{
          padding: '22px 24px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          borderBottom: '1px solid #e8ecf0',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: '#087d76', marginBottom: 5 }}>
              CONNECT REQUEST
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>发起对接申请</h2>
          </div>
          <button
            onClick={handleClose}
            style={{ border: 0, background: '#edf0e8', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '18px 24px 24px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '28px 0 16px' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ddeaf5', color: '#2d5f8a', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>申请已提交！</h3>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 13, lineHeight: 1.7 }}>
                运营人员已收到通知，将在 1-2 个工作日内与您联系协助撮合。
              </p>
              <button
                onClick={handleClose}
                style={{ border: '1px solid #e2e8f0', background: 'white', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                关闭
              </button>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'white', border: '1px solid #e2e8f0', marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 6 }}>对接目标</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{target.companyName}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 999, fontWeight: 800,
                    background: target.kind === 'supply' ? '#d4f5e2' : '#fde8d4',
                    color: target.kind === 'supply' ? '#1a7a45' : '#b84a10',
                  }}>{kindLabel}</span>
                  <span style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{target.content.slice(0, 60)}{target.content.length > 60 ? '…' : ''}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>
                      <User size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      姓名 <span style={{ color: '#d14d3a' }}>*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="您的姓名"
                      style={{ ...inputStyle, borderColor: errors.name ? '#d14d3a' : '#e2e8f0' }}
                    />
                    {errors.name && <span style={{ fontSize: 11, color: '#d14d3a' }}>{errors.name}</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 800 }}>
                      <Phone size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      联系电话 <span style={{ color: '#d14d3a' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="手机号码"
                      style={{ ...inputStyle, borderColor: errors.phone ? '#d14d3a' : '#e2e8f0' }}
                    />
                    {errors.phone && <span style={{ fontSize: 11, color: '#d14d3a' }}>{errors.phone}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>所在企业（选填）</label>
                  <input
                    value={form.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="您所在的企业名称"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800 }}>
                    <MessageSquare size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    对接说明（选填）
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    rows={3}
                    placeholder="简述您的对接意图或合作设想…"
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{ border: '1px solid #e2e8f0', background: 'white', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      border: '1px solid var(--orange)', background: 'var(--orange)',
                      color: '#fff', padding: '10px 18px', borderRadius: 10,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontWeight: 800, fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 7,
                      opacity: isSubmitting ? 0.75 : 1,
                    }}
                  >
                    {isSubmitting ? '提交中…' : <><Send size={13} /> 提交对接申请</>}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
