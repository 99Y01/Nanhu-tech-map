import React, { useState } from 'react';
import { Building2, Zap, Target, Send, CheckCircle } from 'lucide-react';

interface FormData {
  companyName: string;
  building: string;
  room: string;
  contact: string;
  phone: string;
  capability: string;
  demand: string;
  updateType: string;
  remarks: string;
}

const initialFormData: FormData = {
  companyName: '',
  building: '',
  room: '',
  contact: '',
  phone: '',
  capability: '',
  demand: '',
  updateType: 'update',
  remarks: '',
};

const buildingOptions = ["1", "2", "3", "4", "5", "6", "8", "9", "10", "11", "15", "其他"];

const updateTypeOptions = [
  { value: "update", label: "信息更新", desc: "更新现有信息" },
  { value: "new", label: "新增企业", desc: "首次录入" },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--line)',
  borderRadius: 11,
  background: 'white',
  padding: '11px 12px',
  outline: 0,
  fontSize: 13,
  color: 'var(--ink)',
  transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box',
};

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: '#d14d3a',
};

export default function SubmitPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.companyName.trim()) newErrors.companyName = '请填写企业名称';
    if (!formData.contact.trim()) newErrors.contact = '请填写联系人姓名';
    if (!formData.phone.trim()) newErrors.phone = '请填写联系电话';
    if (!formData.capability.trim()) newErrors.capability = '请填写供应能力描述';
    if (!formData.demand.trim()) newErrors.demand = '请填写链接需求描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildSignedWebhookUrl = async (): Promise<string> => {
    const WEBHOOK_URL = 'https://oapi.dingtalk.com/robot/send?access_token=719f9b3614dea0f1b5e92a45cabc755f2970a812e17d920377817504fad580b5';
    const SECRET = 'SEC0f52bd34ead88a54fcee67fe2a6a4369b6340161300684ac51e36b84bb070e55';

    const timestamp = Date.now();
    const stringToSign = `${timestamp}\n${SECRET}`;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const messageData = encoder.encode(stringToSign);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    const encodedSign = encodeURIComponent(signatureBase64);

    return `${WEBHOOK_URL}&timestamp=${timestamp}&sign=${encodedSign}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const signedUrl = await buildSignedWebhookUrl();

      const buildingDisplay = formData.building
        ? `${formData.building}号楼 ${formData.room || ''}`.trim()
        : formData.room || '未填写';

      const messageText = [
        `### 📋 新企业信息提交`,
        ``,
        `**企业名称：**`,
        `${formData.companyName}`,
        ``,
        `**楼栋 / 户号：**`,
        `${buildingDisplay}`,
        ``,
        `**联系人：**`,
        `${formData.contact}`,
        ``,
        `**联系电话：**`,
        `${formData.phone}`,
        ``,
        `**更新类型：**`,
        `${formData.updateType === 'update' ? '信息更新' : '新增企业'}`,
        ``,
        `**供应能力：**`,
        `${formData.capability}`,
        ``,
        `**链接需求：**`,
        `${formData.demand}`,
        ...(formData.remarks ? [``, `**补充说明：**`, `${formData.remarks}`] : []),
      ].join('\n');

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', signedUrl);
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhr.onloadend = () => resolve();
        xhr.onerror = () => resolve();
        xhr.send(JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            title: `新企业信息提交：${formData.companyName}`,
            text: messageText,
          },
        }));
      });
    } catch {
      // Webhook 发送失败不阻断用户流程，静默处理
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setSubmitted(false);
    setErrors({});
  };

  const sectionStyle: React.CSSProperties = {
    border: '1px solid var(--line)',
    borderRadius: 20,
    padding: '18px 20px 20px',
    background: 'rgba(255,255,255,.55)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12, fontWeight: 900, marginBottom: 14, color: 'var(--ink)',
  };

  const fieldStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 7,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 800,
  };

  if (submitted) {
    return (
      <div style={{ padding: '24px 28px 34px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '42px 34px 38px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#ddeaf5', color: '#2d5f8a',
            display: 'grid', placeItems: 'center', margin: '0 auto 18px',
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ margin: '0 0 10px', fontFamily: '"Arial Black", "PingFang SC", sans-serif', fontSize: 26, letterSpacing: '-0.04em' }}>提交成功！</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            感谢 <b style={{ color: 'var(--ink)' }}>{formData.companyName || '贵企业'}</b> 提交信息更新申请。
          </p>
          <p style={{ margin: '6px 0 22px', color: 'var(--muted)', fontSize: 12 }}>
            我们将在 1-3 个工作日内审核并更新地图数据。
          </p>
          <div style={{
            border: '1px solid var(--line)', borderRadius: 16, padding: 16,
            textAlign: 'left', background: 'rgba(255,255,255,.6)', marginBottom: 24,
          }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 900, letterSpacing: '0.08em', marginBottom: 10 }}>提交内容摘要</div>
            {formData.capability && (
              <div style={{ display: 'flex', gap: 9, fontSize: 12, color: 'var(--ink)', marginTop: 7, lineHeight: 1.5 }}>
                <Zap size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{formData.capability}</span>
              </div>
            )}
            {formData.demand && (
              <div style={{ display: 'flex', gap: 9, fontSize: 12, color: 'var(--ink)', marginTop: 7, lineHeight: 1.5 }}>
                <Target size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{formData.demand}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 9 }}>
            <button
              onClick={handleReset}
              style={{
                border: '1px solid var(--orange)', background: 'var(--orange)',
                color: '#342219', padding: '11px 17px', borderRadius: 11,
                cursor: 'pointer', fontWeight: 800, fontSize: 13,
              }}
            >
              继续提交
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px 34px', maxWidth: 680, margin: '0 auto' }}>
      {/* 页头 — 与 MapPage / ListPage 保持一致的 Hero 样式 */}
      <section style={{ margin: '4px 0 28px' }}>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--lake-deep)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lake)', boxShadow: '0 0 0 6px rgba(91,141,184,.15)', display: 'inline-block' }} />
          JOIN THE ATLAS
        </div>
        <h1 style={{
          fontFamily: '"Arial Black", "PingFang SC", sans-serif',
          margin: '11px 0 7px',
          fontSize: 'clamp(35px, 4.3vw, 66px)',
          lineHeight: 1.1,
          letterSpacing: '-0.07em',
          fontStyle: 'normal',
        }}>
          企业信息<em style={{ color: 'var(--lake-deep)', fontStyle: 'normal' }}>更新</em>
        </h1>
        <p style={{ maxWidth: 610, color: 'var(--muted)', lineHeight: 1.9, fontSize: 14, margin: '10px 0 0' }}>
          填写最新的企业供应能力与链接需求，帮助园区内企业更好地发现合作机会
        </p>
      </section>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* 基本信息 */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <Building2 size={15} /> 基本信息
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>企业名称 <span style={{ color: '#d14d3a' }}>*</span></label>
              <input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="请输入完整企业名称"
                style={errors.companyName ? inputErrorStyle : inputStyle}
              />
              {errors.companyName && <span style={{ fontSize: 11, color: '#d14d3a', marginTop: -3 }}>{errors.companyName}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>楼栋</label>
              <select
                value={formData.building}
                onChange={(e) => handleChange('building', e.target.value)}
                style={inputStyle}
              >
                <option value="">请选择楼栋</option>
                {buildingOptions.map(b => (
                  <option key={b} value={b}>{b === '其他' ? '其他' : `${b}号楼`}</option>
                ))}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>户号</label>
              <input
                value={formData.room}
                onChange={(e) => handleChange('room', e.target.value)}
                placeholder="如：301"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>联系人 <span style={{ color: '#d14d3a' }}>*</span></label>
              <input
                value={formData.contact}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="姓名"
                style={errors.contact ? inputErrorStyle : inputStyle}
              />
              {errors.contact && <span style={{ fontSize: 11, color: '#d14d3a', marginTop: -3 }}>{errors.contact}</span>}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>联系电话 <span style={{ color: '#d14d3a' }}>*</span></label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="手机号码"
                style={errors.phone ? inputErrorStyle : inputStyle}
              />
              {errors.phone && <span style={{ fontSize: 11, color: '#d14d3a', marginTop: -3 }}>{errors.phone}</span>}
            </div>
          </div>
        </div>

        {/* 供应能力与链接需求 */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>
            <Zap size={15} /> 供应能力与链接需求
          </div>

          <div style={{ ...fieldStyle, marginBottom: 14 }}>
            <label style={{ ...labelStyle, color: '#2d5f8a' }}>
              供应能力描述 <span style={{ color: '#d14d3a' }}>*</span>
            </label>
            <textarea
              value={formData.capability}
              onChange={(e) => handleChange('capability', e.target.value)}
              rows={3}
              placeholder="一句话描述企业核心供应能力，如：提供无人机飞控系统研发与集成服务…"
              style={{ ...(errors.capability ? inputErrorStyle : inputStyle), resize: 'none' }}
            />
            {errors.capability && <span style={{ fontSize: 11, color: '#d14d3a', marginTop: -3 }}>{errors.capability}</span>}
          </div>

          <div style={fieldStyle}>
            <label style={{ ...labelStyle, color: '#3a6b9a' }}>
              链接需求描述 <span style={{ color: '#d14d3a' }}>*</span>
            </label>
            <textarea
              value={formData.demand}
              onChange={(e) => handleChange('demand', e.target.value)}
              rows={3}
              placeholder="描述企业当前最迫切的合作需求，如：寻求政企客户资源、行业渠道合作伙伴…"
              style={{ ...(errors.demand ? inputErrorStyle : inputStyle), resize: 'none' }}
            />
            {errors.demand && <span style={{ fontSize: 11, color: '#d14d3a', marginTop: -3 }}>{errors.demand}</span>}
          </div>
        </div>

        {/* 更新类型 */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>更新类型</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
            {updateTypeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('updateType', opt.value)}
                style={{
                  border: `1px solid ${formData.updateType === opt.value ? 'var(--lake)' : 'var(--line)'}`,
                  background: formData.updateType === opt.value ? '#ddeaf5' : 'white',
                  borderRadius: 14, padding: 12, textAlign: 'left',
                  cursor: 'pointer', transition: '0.15s ease',
                }}
              >
                <b style={{ display: 'block', fontSize: 12, marginBottom: 3 }}>{opt.label}</b>
                <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>{opt.desc}</span>
              </button>
            ))}
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>补充说明（选填）</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleChange('remarks', e.target.value)}
              rows={2}
              placeholder="其他需要说明的内容…"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 5 }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              border: '1px solid var(--line)', background: 'white',
              padding: '11px 17px', borderRadius: 11,
              cursor: 'pointer', fontWeight: 800, fontSize: 13,
            }}
          >
            重置
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              border: '1px solid var(--orange)', background: 'var(--orange)',
              color: '#ffffff', padding: '11px 17px', borderRadius: 11,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 800, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 7,
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? (
              <>
                <span style={{
                  display: 'inline-block', width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#ffffff',
                  borderRadius: '50%', animation: 'spin 1s linear infinite',
                }} />
                提交中…
              </>
            ) : (
              <><Send size={14} /> 提交更新申请</>
            )}
          </button>
        </div>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
