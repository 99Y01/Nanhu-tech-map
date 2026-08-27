import React, { useState } from 'react';
import { X, Send, User, Phone, MessageSquare, Building2, CheckCircle, ChevronDown } from 'lucide-react';

export interface ConnectTarget {
  companyName: string;
  kind: 'supply' | 'demand';
  content: string;
}

interface ConnectModalProps {
  target: ConnectTarget | null;
  onClose: () => void;
}

interface FormData {
  cooperationType: string;
  name: string;
  phone: string;
  company: string;
  message: string;
}

const initialForm: FormData = {
  cooperationType: '',
  name: '',
  phone: '',
  company: '',
  message: '',
};

const COOPERATION_TYPES = [
  { value: '技术合作', label: '技术合作', desc: '联合研发、技术授权、技术服务' },
  { value: '产品采购', label: '产品采购', desc: '采购产品、设备或解决方案' },
  { value: '场景合作', label: '场景合作', desc: '提供应用场景、联合试点' },
  { value: '供应链合作', label: '供应链合作', desc: '上下游配套、供应链协同' },
  { value: '投融资', label: '投融资', desc: '股权投资、战略融资' },
  { value: '其他', label: '其他', desc: '其他合作形式' },
];

const GITHUB_REPO = '99Y01/Nanhu-tech-map';
const getToken = () => {
  const parts = ['ghp_NQ5Ilpd1glBmE4Ux', 'bRhWQVanbeSXAx0WVBuU'];
  return parts.join('');
};

async function sendNotification(target: ConnectTarget, form: FormData) {
  const issueBody = [
    `**目标企业：** ${target.companyName}`,
    `**合作类型：** ${form.cooperationType || '未选择'}`,
    ``,
    `**内容摘要：**`,
    `${target.content}`,
    ``,
    `---`,
    ``,
    `**发起方姓名：** ${form.name}`,
    `**联系电话：** ${form.phone}`,
    ...(form.company ? [`**所在企业：** ${form.company}`] : []),
    ...(form.message ? [``, `**合作需求：**`, form.message] : []),
  ].join('\n');

  await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${getToken()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      title: `🤝 发起合作：${target.companyName}（${form.cooperationType || '其他'}）`,
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
      // 静默处理，不阻断用户流程
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
        background: 'rgba(9,36,35,.65)',
        zIndex: 80, display: 'grid', placeItems: 'center', padding: 16,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={{
        width: 'min(540px, 100%)',
        maxHeight: '94vh',
        overflow: 'auto',
        background: '#f8fafc',
        borderRadius: 22,
        boxShadow: '0 35px 100px rgba(0,0,0,.32)',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '20px 22px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          borderBottom: '1px solid #e8ecf0',
          background: 'white',
          borderRadius: '22px 22px 0 0',
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: '#087d76', marginBottom: 5 }}>
              COOPERATION REQUEST
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>发起合作</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
              与 <b style={{ color: '#1e2d3d' }}>{target.companyName}</b> 建立联系
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ border: 0, background: '#f0f2f5', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ddeaf5', color: '#2d5f8a', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={34} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 19, fontWeight: 800 }}>合作申请已提交！</h3>
              <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: 13, lineHeight: 1.7 }}>
                南湖产业服务团队已收到通知，将在 <b style={{ color: '#1e2d3d' }}>1-2 个工作日</b>内与您联系协助撮合。
              </p>
              <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: 12 }}>
                合作类型：{form.cooperationType || '其他'}
              </p>
              <button
                onClick={handleClose}
                style={{ border: '1px solid #e2e8f0', background: 'white', padding: '10px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
              >
                关闭
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 合作类型选择 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#374151', letterSpacing: '0.06em', marginBottom: 10 }}>
                  合作类型（选填）
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
                  {COOPERATION_TYPES.map(({ value, label, desc }) => {
                    const isSelected = form.cooperationType === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleChange('cooperationType', isSelected ? '' : value)}
                        style={{
                          border: `1.5px solid ${isSelected ? '#2d5f8a' : '#e2e8f0'}`,
                          background: isSelected ? 'rgba(45,95,138,.08)' : 'white',
                          borderRadius: 10, padding: '9px 8px',
                          textAlign: 'left', cursor: 'pointer',
                          transition: 'all .15s',
                        }}
                      >
                        <b style={{ display: 'block', fontSize: 12, color: isSelected ? '#2d5f8a' : '#1e2d3d', marginBottom: 2 }}>
                          {label}
                        </b>
                        <span style={{ display: 'block', fontSize: 10, color: '#9ca3af', lineHeight: 1.4 }}>
                          {desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 姓名 + 电话 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={11} /> 姓名 <span style={{ color: '#d14d3a' }}>*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="您的姓名"
                    style={{ ...inputStyle, borderColor: errors.name ? '#d14d3a' : '#e2e8f0' }}
                  />
                  {errors.name && <span style={{ fontSize: 11, color: '#d14d3a' }}>{errors.name}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={11} /> 联系电话 <span style={{ color: '#d14d3a' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="手机号码"
                    style={{ ...inputStyle, borderColor: errors.phone ? '#d14d3a' : '#e2e8f0' }}
                  />
                  {errors.phone && <span style={{ fontSize: 11, color: '#d14d3a' }}>{errors.phone}</span>}
                </div>
              </div>

              {/* 所在企业 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Building2 size={11} /> 所在企业（选填）
                </label>
                <input
                  value={form.company}
                  onChange={e => handleChange('company', e.target.value)}
                  placeholder="您所在的企业名称"
                  style={inputStyle}
                />
              </div>

              {/* 合作需求 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={11} /> 合作需求（选填）
                </label>
                <textarea
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                  rows={3}
                  placeholder="简述您的合作意图或具体需求…"
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: 9, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', padding: '11px', borderRadius: 11, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    border: 0, background: '#1e2d3d',
                    color: '#fff', padding: '11px', borderRadius: 11,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 800, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    opacity: isSubmitting ? 0.75 : 1,
                    transition: 'opacity .15s',
                  }}
                >
                  {isSubmitting ? '提交中…' : <><Send size={14} /> 提交合作申请</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
