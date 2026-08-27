import React, { useState } from 'react';
import { Company, buildingColors } from '../data/companyData';
import {
  X, Building2, Sparkles, Link as LinkIcon,
  MapPin, ArrowRight, Users, ChevronRight,
} from 'lucide-react';
import ConnectModal from './ConnectModal';
import { useNavigate } from 'react-router-dom';

interface CompanyModalProps {
  company: Company | null;
  onClose: () => void;
}

// ─── 工具函数 ─────────────────────────────────────────────────

// 从 capability 文本推断产业标签
function inferIndustryTags(company: Company): string[] {
  const text = `${company.name} ${company.capability} ${company.demand}`;
  const tagMap: [string, string][] = [
    ['新能源', '新能源'],
    ['储能', '储能'],
    ['液冷', '液冷'],
    ['供配电', '供配电'],
    ['电池', '新能源'],
    ['无人机', '低空经济'],
    ['低空', '低空经济'],
    ['飞控', '飞控系统'],
    ['机器人', '机器人'],
    ['具身智能', '具身智能'],
    ['医疗', '医疗健康'],
    ['大模型', '大模型'],
    ['AIGC', 'AIGC'],
    ['算法', 'AI算法'],
    ['智能体', 'AI智能体'],
    ['AI', 'AI'],
    ['算力', '算力'],
    ['巡检', '智慧巡检'],
    ['检测', '检测认证'],
    ['培训', '教育培训'],
    ['设计', '工业设计'],
  ];
  const found: string[] = [];
  for (const [keyword, tag] of tagMap) {
    if (text.includes(keyword) && !found.includes(tag)) {
      found.push(tag);
      if (found.length >= 3) break;
    }
  }
  return found;
}

// 推断适合的合作场景
function inferScenarios(company: Company): string[] {
  const text = `${company.capability} ${company.demand}`;
  const scenarioMap: [string, string][] = [
    ['工业', '工业制造'],
    ['物流', '物流仓储'],
    ['园区', '智慧园区'],
    ['医疗', '医疗健康'],
    ['低空', '低空应用'],
    ['巡检', '智慧巡检'],
    ['安防', '安防监控'],
    ['教育', '教育培训'],
    ['文旅', '文旅场景'],
    ['政府', '政务应用'],
    ['农业', '智慧农业'],
    ['能源', '能源管理'],
  ];
  const found: string[] = [];
  for (const [keyword, scene] of scenarioMap) {
    if (text.includes(keyword) && !found.includes(scene)) {
      found.push(scene);
      if (found.length >= 4) break;
    }
  }
  return found;
}

// ─── 主组件 ──────────────────────────────────────────────────

export default function CompanyModal({ company, onClose }: CompanyModalProps) {
  const [showConnect, setShowConnect] = useState(false);
  const navigate = useNavigate();

  if (!company) return null;

  const buildingColor = buildingColors[company.building] || '#2d5f8a';
  const industryTags = inferIndustryTags(company);
  const scenarios = inferScenarios(company);

  const handleGoToMap = () => {
    onClose();
    navigate(`/map?building=${company.building}`);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9,36,35,.6)',
          zIndex: 70, display: 'flex', alignItems: 'flex-end',
          padding: 0,
        }}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <style>{`
          @media (min-width: 641px) {
            .company-modal-sheet {
              position: relative !important;
              margin: auto !important;
              border-radius: 24px !important;
              max-height: 92vh !important;
              width: min(720px, 100%) !important;
            }
            .company-modal-overlay {
              align-items: center !important;
              padding: 20px !important;
            }
          }
          .company-modal-sheet {
            width: 100%;
            max-height: 92vh;
            overflow-y: auto;
            background: #f8fafc;
            border-radius: 22px 22px 0 0;
            box-shadow: 0 -8px 60px rgba(0,0,0,.28);
            display: flex;
            flex-direction: column;
          }
        `}</style>

        <div
          className="company-modal-overlay"
          style={{ width: '100%', display: 'flex', alignItems: 'flex-end', padding: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="company-modal-sheet">

            {/* ── 顶部企业信息 ── */}
            <div style={{
              background: 'white',
              borderBottom: '1px solid var(--line)',
              padding: '20px 22px 18px',
              borderRadius: '22px 22px 0 0',
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 标签 */}
                  <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--lake-deep)', letterSpacing: '0.12em', marginBottom: 6 }}>
                    ENTERPRISE PROFILE
                  </div>
                  {/* 企业名 */}
                  <h2 style={{
                    margin: '0 0 10px',
                    fontFamily: '"PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
                    fontSize: 'clamp(18px, 3vw, 24px)',
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}>
                    {company.name}
                  </h2>
                  {/* 产业标签 + 楼栋 */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {industryTags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 9px',
                        borderRadius: 999, background: 'rgba(45,95,138,.09)',
                        color: 'var(--lake-deep)',
                      }}>
                        {tag}
                      </span>
                    ))}
                    {company.building !== '-' && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 9px',
                        borderRadius: 999,
                        background: buildingColor + '15',
                        color: buildingColor,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Building2 size={11} /> {company.building}号楼
                      </span>
                    )}
                  </div>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  style={{
                    border: 0, background: '#f0f2f5',
                    width: 36, height: 36, borderRadius: '50%',
                    cursor: 'pointer', display: 'grid', placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── 内容区 ── */}
            <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* 我们能提供 */}
              {company.capability && (
                <section style={{
                  border: '1px solid rgba(26,122,69,.18)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'white',
                }}>
                  <div style={{
                    padding: '12px 16px 10px',
                    background: 'rgba(26,122,69,.05)',
                    borderBottom: '1px solid rgba(26,122,69,.12)',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <Sparkles size={14} color="#1a7a45" />
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#1a7a45', letterSpacing: '0.06em' }}>
                      我们能提供
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#374151' }}>
                      {company.capability}
                    </p>
                  </div>
                </section>
              )}

              {/* 我们正在寻找 */}
              {company.demand && (
                <section style={{
                  border: '1px solid rgba(184,74,16,.18)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'white',
                }}>
                  <div style={{
                    padding: '12px 16px 10px',
                    background: 'rgba(184,74,16,.05)',
                    borderBottom: '1px solid rgba(184,74,16,.12)',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <LinkIcon size={14} color="#b84a10" />
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#b84a10', letterSpacing: '0.06em' }}>
                      我们正在寻找
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#374151' }}>
                      {company.demand}
                    </p>
                  </div>
                </section>
              )}

              {/* 适合场景 */}
              {scenarios.length > 0 && (
                <section style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  background: 'white',
                  padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
                    适合场景
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {scenarios.map(scene => (
                      <span key={scene} style={{
                        fontSize: 12, fontWeight: 600, padding: '5px 11px',
                        borderRadius: 8, background: 'rgba(30,45,61,.05)',
                        color: 'var(--ink)', border: '1px solid var(--line)',
                      }}>
                        {scene}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 企业位置 */}
              {company.building !== '-' && (
                <section style={{
                  border: '1px solid var(--line)',
                  borderRadius: 16,
                  background: 'white',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: buildingColor + '15',
                      display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <MapPin size={18} color={buildingColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                        {company.building}号楼
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        南湖未来科学园
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 底部间距，防止被固定按钮遮挡 */}
              <div style={{ height: 8 }} />
            </div>

            {/* ── 底部固定 CTA ── */}
            <div style={{
              position: 'sticky', bottom: 0,
              background: 'white',
              borderTop: '1px solid var(--line)',
              padding: '14px 22px max(14px, env(safe-area-inset-bottom))',
            }}>
              <button
                onClick={() => setShowConnect(true)}
                style={{
                  width: '100%',
                  border: 0, background: 'var(--ink)',
                  color: 'white', borderRadius: 13, padding: '14px',
                  fontWeight: 800, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'opacity .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <ArrowRight size={16} /> 发起对接
              </button>
            </div>
          </div>
        </div>
      </div>

      {showConnect && (
        <ConnectModal
          target={{ companyName: company.name, kind: 'supply', content: company.capability || company.demand }}
          onClose={() => setShowConnect(false)}
        />
      )}
    </>
  );
}
