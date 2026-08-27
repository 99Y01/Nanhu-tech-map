import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { companies, Company } from '../../data/companyData';
import ConnectModal, { ConnectTarget } from '../../components/ConnectModal';
import { Search, ExternalLink } from 'lucide-react';

const MAP_IMAGE_URL = 'https://1d-static.alibaba-inc.com/oneday/source/ab44ae18-0e98-4e82-9a3b-54e4b9007eb4.png';
const MAP_IMAGE_ASPECT_RATIO = 8492 / 5097;

interface BuildingLayout {
  x: number;
  y: number;
  open: boolean;
}

const buildingLayout: Record<string, BuildingLayout> = {
  "1":  { x: 61.7, y: 59.7, open: false },
  "2":  { x: 53.8, y: 46.2, open: false },
  "3":  { x: 38.4, y: 37.8, open: true  },
  "4":  { x: 46.8, y: 31.1, open: true  },
  "5":  { x: 54.4, y: 21.8, open: true  },
  "6":  { x: 61.4, y: 21.4, open: true  },
  "7":  { x: 76.1, y: 27.2, open: false },
  "8":  { x: 71.6, y: 40.9, open: true  },
  "9":  { x: 66.2, y: 50.6, open: true  },
  "10": { x: 61.6, y: 74.3, open: true  },
  "11": { x: 47.4, y: 64.9, open: true  },
  "12": { x: 35.1, y: 54.5, open: false },
  "13": { x: 25.7, y: 43.6, open: false },
  "14": { x: 26,   y: 59.1, open: false },
  "15": { x: 38.7, y: 69.3, open: true  },
  "16": { x: 29.7, y: 73.3, open: false },
};

const INDUSTRY_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'AI', label: 'AI' },
  { key: '低空经济', label: '低空经济' },
  { key: '具身智能', label: '具身智能' },
  { key: '未来医疗', label: '未来医疗' },
  { key: '其他', label: '其他' },
];

const RESOURCE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'capability', label: '技术/产品' },
  { key: 'demand', label: '合作需求' },
];

const AI_KEYWORDS = ['AI', '人工智能', '大模型', '算法', 'AIGC', '智能体', '机器学习', '深度学习', '视觉', '语音', '自然语言'];
const LOW_ALT_KEYWORDS = ['低空', '无人机', '飞行', '航空', '飞控', '起降', '空域', '航线', '飞手', '旋翼', '固定翼'];
const EMBODIED_KEYWORDS = ['具身', '机器人', '机械臂', '运动控制', '多智能体', '协同', '巡检机器人'];
const MEDICAL_KEYWORDS = ['医疗', '医学', '健康', '诊断', '手术', '药物', '生物', '基因', '心理'];

export function inferIndustryTag(company: Company): string {
  const text = `${company.capability} ${company.demand}`.toLowerCase();
  const nameText = company.name.toLowerCase();
  const fullText = `${text} ${nameText}`;
  if (EMBODIED_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '具身智能';
  if (LOW_ALT_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '低空经济';
  if (MEDICAL_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '未来医疗';
  if (AI_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return 'AI';
  return '其他';
}

export function extractOneLiner(text: string): string {
  if (!text) return '';
  const firstSentence = text.split(/[。；！？\n]/)[0];
  return firstSentence.length > 60 ? firstSentence.slice(0, 60) + '…' : firstSentence;
}

export const INDUSTRY_TAG_COLORS: Record<string, { bg: string; color: string }> = {
  'AI': { bg: '#ede9fe', color: '#6d28d9' },
  '低空经济': { bg: '#e0f2fe', color: '#0369a1' },
  '具身智能': { bg: '#f3e8ff', color: '#7c3aed' },
  '未来医疗': { bg: '#fce7f3', color: '#be185d' },
  '其他': { bg: '#f1f5f9', color: '#475569' },
};

interface ResourceMapTabProps {
  initialBuilding?: string | null;
}

export default function ResourceMapTab({ initialBuilding }: ResourceMapTabProps) {
  const navigate = useNavigate();
  const [industryFilter, setIndustryFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(initialBuilding ?? null);
  const [connectTarget, setConnectTarget] = useState<ConnectTarget | null>(null);
  const [bouncingBuilding, setBouncingBuilding] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const recalculateImageRect = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const ca = cw / ch;
    let iw: number, ih: number;
    if (ca > MAP_IMAGE_ASPECT_RATIO) {
      ih = ch; iw = ch * MAP_IMAGE_ASPECT_RATIO;
    } else {
      iw = cw; ih = cw / MAP_IMAGE_ASPECT_RATIO;
    }
    setImageRect({ left: (cw - iw) / 2, top: (ch - ih) / 2, width: iw, height: ih });
  }, []);

  useEffect(() => {
    recalculateImageRect();
    const observer = new ResizeObserver(recalculateImageRect);
    if (mapContainerRef.current) observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [recalculateImageRect]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      if (industryFilter !== 'all' && inferIndustryTag(company) !== industryFilter) return false;
      if (resourceFilter === 'capability' && !company.capability) return false;
      if (resourceFilter === 'demand' && !company.demand) return false;
      return true;
    });
  }, [industryFilter, resourceFilter]);

  const buildingCompanyCount = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCompanies.forEach(c => { map[c.building] = (map[c.building] || 0) + 1; });
    return map;
  }, [filteredCompanies]);

  const buildingsWithCompanies = useMemo(() => new Set(filteredCompanies.map(c => c.building)), [filteredCompanies]);

  const companiesInSelectedBuilding = useMemo(() => {
    if (!selectedBuilding) return filteredCompanies;
    return filteredCompanies.filter(c => c.building === selectedBuilding);
  }, [selectedBuilding, filteredCompanies]);

  const handleBuildingClick = useCallback((buildingNo: string) => {
    if (!buildingsWithCompanies.has(buildingNo)) return;
    setSelectedBuilding(prev => {
      const next = prev === buildingNo ? null : buildingNo;
      if (next) { setBouncingBuilding(null); requestAnimationFrame(() => setBouncingBuilding(next)); }
      return next;
    });
  }, [buildingsWithCompanies]);

  const handleViewDetail = useCallback((company: Company) => {
    navigate('/list', { state: { openCompanyId: company.id } });
  }, [navigate]);

  const handleGoToList = () => {
    const params = new URLSearchParams();
    if (industryFilter !== 'all') params.set('q', industryFilter);
    navigate(`/list${params.toString() ? '?' + params.toString() : ''}`);
  };

  const hasResults = filteredCompanies.length > 0;

  return (
    <>
      <style>{`
        @keyframes pinPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
        @keyframes labelBounce {
          0% { transform: scale(1); }
          100% { transform: scale(1.18); }
        }
        @media (max-width: 700px) {
          .rmap-section {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .rmap-map-area { height: 56vw !important; min-height: 220px !important; }
          .rmap-sidebar { max-height: 360px !important; overflow-y: auto !important; }
          .rmap-filter-row { flex-wrap: wrap !important; gap: 6px !important; }
        }
      `}</style>

      <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="rmap-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.06em', flexShrink: 0 }}>产业</span>
          {INDUSTRY_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => { setIndustryFilter(key); setSelectedBuilding(null); }} style={{
              border: `1.5px solid ${industryFilter === key ? 'var(--ink)' : 'var(--line)'}`,
              background: industryFilter === key ? 'var(--ink)' : 'white',
              color: industryFilter === key ? 'white' : 'var(--ink)',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 12, fontWeight: industryFilter === key ? 700 : 400,
              cursor: 'pointer', transition: '0.15s ease',
            }}>{label}</button>
          ))}
        </div>
        <div className="rmap-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.06em', flexShrink: 0 }}>资源</span>
          {RESOURCE_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => { setResourceFilter(key); setSelectedBuilding(null); }} style={{
              border: `1.5px solid ${resourceFilter === key ? 'var(--lake-deep)' : 'var(--line)'}`,
              background: resourceFilter === key ? 'var(--lake-deep)' : 'white',
              color: resourceFilter === key ? 'white' : 'var(--ink)',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 12, fontWeight: resourceFilter === key ? 700 : 400,
              cursor: 'pointer', transition: '0.15s ease',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {!hasResults ? (
        <div style={{ border: '1px solid var(--line)', borderRadius: 24, background: 'white', padding: '60px 24px', textAlign: 'center' }}>
          <Search size={36} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>暂时没有找到相关开放资源</h3>
          <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: 13 }}>当前筛选条件下没有匹配的企业资源</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setIndustryFilter('all'); setResourceFilter('all'); }} style={{ border: '1px solid var(--ink)', background: 'white', color: 'var(--ink)', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>调整筛选</button>
            <button onClick={handleGoToList} style={{ border: 0, background: 'var(--ink)', color: 'white', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>查看全部资源</button>
          </div>
        </div>
      ) : (
        <section className="rmap-section" style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px',
          height: 600, border: '1px solid var(--line)', borderRadius: 24,
          background: '#e8edf4', overflow: 'hidden', boxShadow: 'var(--shadow)',
        }}>
          <div className="rmap-map-area" ref={mapContainerRef}
            style={{ position: 'relative', overflow: 'hidden', background: '#dde4ee', cursor: 'default' }}
            onClick={() => setSelectedBuilding(null)}
          >
            <img src={MAP_IMAGE_URL} alt="南湖未来科学园平面示意图" style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center',
              pointerEvents: 'none', userSelect: 'none', zIndex: 1,
            }} />

            <div style={{ position: 'absolute', left: imageRect.left, top: imageRect.top, width: imageRect.width, height: imageRect.height, zIndex: 5 }}>
              {Object.entries(buildingLayout).map(([buildingNo, layout]) => {
                const count = buildingCompanyCount[buildingNo] || 0;
                const hasCompanies = count > 0;
                const isSelected = selectedBuilding === buildingNo;
                const isDimmed = selectedBuilding !== null && !isSelected;
                const isBouncing = bouncingBuilding === buildingNo;

                const centerX = (layout.x / 100) * imageRect.width;
                const centerY = (layout.y / 100) * imageRect.height;
                const isMobile = imageRect.width > 0 && imageRect.width < 500;

                if (!hasCompanies && !layout.open) return null;

                if (!hasCompanies && layout.open) {
                  return (
                    <div key={buildingNo} style={{
                      position: 'absolute', left: centerX, top: centerY,
                      transform: 'translate(-50%, -50%)',
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#c8d4e0', border: '2px solid rgba(255,255,255,.7)',
                      boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                      opacity: isDimmed ? 0.3 : 0.6,
                      transition: 'opacity 0.22s ease',
                      zIndex: 4,
                      pointerEvents: 'none',
                    }} />
                  );
                }

                const pinSize = isSelected ? (isMobile ? 30 : 44) : (isMobile ? 22 : 36);
                const pinWidth = pinSize;
                const pinHeight = Math.round(pinSize * 1.22);
                const r = pinWidth / 2;
                const tailY = pinHeight - r * 0.12;
                const bodyBottom = r + r * 0.62;
                const pinColor = isSelected ? '#0d3d8a' : '#1565c0';

                return (
                  <button key={buildingNo}
                    onClick={e => { e.stopPropagation(); handleBuildingClick(buildingNo); }}
                    style={{
                      position: 'absolute', left: centerX, top: centerY,
                      transform: 'translate(-50%, -50%)',
                      border: 0, background: 'transparent', padding: 0,
                      cursor: 'pointer', opacity: isDimmed ? 0.4 : 1,
                      transition: 'opacity 0.22s ease', zIndex: isSelected ? 8 : 6,
                    }}
                    aria-label={`${buildingNo}号楼，${count}家企业`}
                  >
                    <div onAnimationEnd={() => setBouncingBuilding(null)} style={{
                      position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                      animation: isBouncing ? 'labelBounce 0.5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
                      filter: isSelected
                        ? 'drop-shadow(0 6px 14px rgba(0,0,0,.45)) drop-shadow(0 2px 4px rgba(13,61,138,.6))'
                        : 'drop-shadow(0 4px 10px rgba(0,0,0,.3)) drop-shadow(0 2px 5px rgba(21,101,192,.3))',
                    }}>
                      <svg width={pinWidth} height={pinHeight} viewBox={`0 0 ${pinWidth} ${pinHeight}`} style={{ display: 'block', overflow: 'visible' }}>
                        <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth={isSelected ? 3.5 : 3} />
                        <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill={pinColor} />
                        <text x={r} y={r + r * 0.08} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={isSelected ? (isMobile ? 15 : 22) : (isMobile ? 11 : 18)} fontWeight="900" fontFamily='"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif' style={{ userSelect: 'none' }}>{buildingNo}</text>
                      </svg>
                      <span style={{
                        position: 'absolute', right: isMobile ? -4 : -6, top: isMobile ? -4 : -6,
                        minWidth: isMobile ? 15 : 20, height: isMobile ? 15 : 20, padding: isMobile ? '0 3px' : '0 4px',
                        borderRadius: 999,
                        background: isSelected ? 'linear-gradient(135deg, #ff8c00, #f05a00)' : 'linear-gradient(135deg, #ff9a1a, #e85d00)',
                        border: '2px solid rgba(255,255,255,.98)',
                        display: 'grid', placeItems: 'center',
                        color: '#fff', fontSize: isMobile ? 8 : 10, fontWeight: 900,
                        boxShadow: '0 2px 8px rgba(220,90,0,.4)',
                        lineHeight: 1, transition: 'all 0.22s ease',
                        transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                        letterSpacing: '-0.02em',
                        fontFamily: '"Nunito","Varela Round","PingFang SC",sans-serif',
                      }}>{count}</span>
                      {isSelected && (
                        <svg width={pinWidth + 16} height={pinHeight + 16} viewBox={`${-8} ${-8} ${pinWidth + 16} ${pinHeight + 16}`} style={{ position: 'absolute', top: -8, left: -8, pointerEvents: 'none', zIndex: -1, animation: 'pinPulse 1.8s ease-in-out infinite' }}>
                          <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="rgba(21,101,192,.1)" stroke="rgba(21,101,192,.28)" strokeWidth="3" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 10, background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)', border: '1px solid rgba(91,141,184,.2)', borderRadius: 10, padding: '7px 12px', fontSize: 11, color: 'var(--muted)', boxShadow: '0 2px 10px rgba(0,0,0,.1)' }}>
              展示当前已开放产业资源的企业，持续更新中
            </div>
          </div>

          <aside className="rmap-sidebar" style={{ background: 'var(--cream)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', minHeight: 0 }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--lake-deep)', letterSpacing: '0.1em' }}>
                  {selectedBuilding ? `${selectedBuilding} 号楼 · 开放资源` : '开放资源企业'}
                </span>
                {selectedBuilding && (
                  <button onClick={() => setSelectedBuilding(null)} style={{ border: '1px solid var(--line)', background: 'white', color: 'var(--ink)', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>返回全部</button>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                <b style={{ color: 'var(--ink)', fontSize: 22, fontFamily: '"Arial Black", "PingFang SC", sans-serif', letterSpacing: '-0.04em' }}>{companiesInSelectedBuilding.length}</b>
                {' '}家企业
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '12px 16px 20px', flex: 1, minHeight: 0 }}>
              {companiesInSelectedBuilding.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  <Search size={28} style={{ margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontSize: 13 }}>该楼栋暂无开放资源</p>
                </div>
              ) : (
                companiesInSelectedBuilding.map(company => {
                  const industryTag = inferIndustryTag(company);
                  const tagStyle = INDUSTRY_TAG_COLORS[industryTag] || INDUSTRY_TAG_COLORS['其他'];
                  return (
                    <article key={company.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 13, marginBottom: 9, background: 'white', cursor: 'pointer', transition: '0.18s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '5px 6px 0 rgba(54,183,173,.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>{company.name}</h3>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: tagStyle.bg, color: tagStyle.color, flexShrink: 0 }}>{industryTag}</span>
                      </div>
                      {company.capability && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#1a7a45', background: '#d4f5e2', display: 'inline-block', padding: '2px 7px', borderRadius: 999, marginBottom: 4, letterSpacing: '0.04em' }}>能提供</div>
                          <p style={{ margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{extractOneLiner(company.capability)}</p>
                        </div>
                      )}
                      {company.demand && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 10, fontWeight: 900, color: '#b84a10', background: '#fde8d4', display: 'inline-block', padding: '2px 7px', borderRadius: 999, marginBottom: 4, letterSpacing: '0.04em' }}>正在寻找</div>
                          <p style={{ margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{extractOneLiner(company.demand)}</p>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={e => { e.stopPropagation(); handleViewDetail(company); }} style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#1e2d3d', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>查看企业</button>
                        <button onClick={e => { e.stopPropagation(); setConnectTarget({ companyName: company.name, kind: 'supply', content: company.capability || company.demand || '' }); }} style={{ flex: 1, border: 0, background: '#1e2d3d', color: 'white', borderRadius: 8, padding: '6px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>发起对接</button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
              <button onClick={handleGoToList} style={{ width: '100%', border: '1px solid var(--line)', background: 'white', color: 'var(--ink)', borderRadius: 10, padding: '10px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: '0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                <ExternalLink size={13} />
                查看全部资源
              </button>
            </div>
          </aside>
        </section>
      )}

      <ConnectModal target={connectTarget} onClose={() => setConnectTarget(null)} />
    </>
  );
}
