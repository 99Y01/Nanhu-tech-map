import React, { useState } from 'react';
import { Company, buildingColors } from '../data/companyData';
import { X, Building2, User, Sparkles, Link, Send, MapPin } from 'lucide-react';
import ConnectModal from './ConnectModal';

interface CompanyModalProps {
  company: Company | null;
  onClose: () => void;
}

async function sendDingTalkConnect(company: Company) {
  const WEBHOOK_URL = 'https://oapi.dingtalk.com/robot/send?access_token=719f9b3614dea0f1b5e92a45cabc755f2970a812e17d920377817504fad580b5';
  const SECRET = 'SEC0f52bd34ead88a54fcee67fe2a6a4369b6340161300684ac51e36b84bb070e55';

  const timestamp = Date.now();
  const encoder = new TextEncoder();
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw', encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(`${timestamp}\n${SECRET}`));
  const encodedSign = encodeURIComponent(btoa(String.fromCharCode(...new Uint8Array(signatureBuffer))));
  const signedUrl = `${WEBHOOK_URL}&timestamp=${timestamp}&sign=${encodedSign}`;

  const messageText = [
    `### 🤝 发起资源连接（企业档案）`,
    ``,
    `**企业名称：**`,
    `${company.name}`,
    ``,
    `**位置：**`,
    `${company.address !== '-' ? company.address : '待确认'}`,
    ``,
    `**联系人：**`,
    `${company.contact}`,
    ...(company.capability ? [``, `**可提供能力：**`, `${company.capability}`] : []),
    ...(company.demand ? [``, `**链接需求：**`, `${company.demand}`] : []),
  ].join('\n');

  await fetch(signedUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: { title: `发起连接：${company.name}`, text: messageText },
    }),
  });
}

export default function CompanyModal({ company, onClose }: CompanyModalProps) {
  const [showConnect, setShowConnect] = useState(false);

  if (!company) return null;

  const buildingColor = buildingColors[company.building] || '#163b3b';

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(9,36,35,.58)',
        zIndex: 70, display: 'grid', placeItems: 'center', padding: 20,
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: 'min(690px, 100%)',
        maxHeight: '92vh',
        overflow: 'auto',
        background: 'var(--cream)',
        borderRadius: 25,
        boxShadow: '0 35px 100px rgba(0,0,0,.3)',
      }}>
        {/* 头部 */}
        <div style={{
          padding: '24px 26px 18px',
          display: 'flex', justifyContent: 'space-between',
          borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <div style={{ color: 'var(--lake-deep)', fontSize: 11, fontWeight: 900, letterSpacing: '0.12em' }}>
              ENTERPRISE PROFILE · NO.{String(company.id).padStart(2, '0')}
            </div>
            <h2 style={{ margin: '6px 0 0', fontFamily: 'Georgia, serif', fontSize: 27, fontWeight: 'normal' }}>
              {company.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 0, background: '#edf0e8',
              width: 36, height: 36, borderRadius: '50%',
              cursor: 'pointer', display: 'grid', placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容 */}
        <div style={{ padding: '24px 27px 28px' }}>
          {/* 元信息 */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {company.building !== '-' && (
              <span style={{
                padding: '7px 10px', borderRadius: 9, fontSize: 11,
                background: buildingColor + '18', color: buildingColor,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Building2 size={12} /> {company.building}号楼
              </span>
            )}
          </div>

          {/* 供应能力 */}
          {company.capability && (
            <div style={{
              padding: 17, borderRadius: 15, marginTop: 12,
              border: '1px solid var(--line)', background: '#e9f7f1',
            }}>
              <label style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 8, color: '#087d76' }}>
                <Sparkles size={13} /> 可提供的能力
              </label>
              <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14 }}>{company.capability}</p>
            </div>
          )}

          {/* 链接需求 */}
          <div style={{
            padding: 17, borderRadius: 15, marginTop: 12,
            border: '1px solid var(--line)',
            background: company.demand ? '#fff1e8' : 'rgba(255,255,255,.4)',
          }}>
            <label style={{ display: 'flex', gap: 7, alignItems: 'center', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', marginBottom: 8, color: '#ad4f27' }}>
              <Link size={13} /> 想链接的资源
            </label>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: 14, color: company.demand ? 'var(--ink)' : 'var(--muted)' }}>
              {company.demand || '期待与园区伙伴探索合作机会'}
            </p>
          </div>

          {/* 操作 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button
              onClick={() => setShowConnect(true)}
              style={{
                border: '1px solid var(--orange)', background: 'var(--orange)',
                color: '#342219', padding: '11px 17px', borderRadius: 11,
                cursor: 'pointer', fontWeight: 800, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Send size={14} /> 发起资源连接
            </button>
          </div>
        </div>
      </div>
      {showConnect && (
        <ConnectModal
          target={{ companyName: company.name, kind: 'supply', content: company.capability || company.demand }}
          onClose={() => setShowConnect(false)}
        />
      )}
    </div>
  );
}
