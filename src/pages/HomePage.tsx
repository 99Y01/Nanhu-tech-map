import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, ChevronRight,
  Cpu, Wind, Bot, HeartPulse,
  Building2, Zap, Link as LinkIcon,
  MapPin, Users, Package, Layers,
  FlaskConical, Server, TestTube, Database, Wrench,
  ExternalLink,
} from 'lucide-react';
import { companies } from '../data/companyData';
import CompanyModal from '../components/CompanyModal';
import ConnectModal, { ConnectTarget } from '../components/ConnectModal';
import type { Company } from '../data/companyData';

// ─── 产业方向 ─────────────────────────────────────────────────

const INDUSTRY_TABS = [
  { key: 'all', label: '全部', icon: null, color: '#1e2d3d', keyword: '' },
  { key: 'ai', label: 'AI & 大模型', icon: <Cpu size={14} />, color: '#2d5f8a', keyword: 'AI' },
  { key: 'lowalt', label: '低空经济', icon: <Wind size={14} />, color: '#087d76', keyword: '低空' },
  { key: 'robot', label: '具身智能', icon: <Bot size={14} />, color: '#6b3fa0', keyword: '具身智能' },
  { key: 'med', label: '未来医疗', icon: <HeartPulse size={14} />, color: '#b84a10', keyword: '医疗' },
];

// ─── 开放资源分类 ─────────────────────────────────────────────

const RESOURCE_TYPES = [
  { key: 'compute', label: '算力', icon: <Server size={18} />, color: '#2d5f8a', bg: '#e8f2fb', keyword: '算力' },
  { key: 'lab', label: '实验空间', icon: <FlaskConical size={18} />, color: '#087d76', bg: '#e0f5f4', keyword: '实验' },
  { key: 'test', label: '测试场景', icon: <TestTube size={18} />, color: '#6b3fa0', bg: '#f0eaf8', keyword: '测试' },
  { key: 'data', label: '数据/模型', icon: <Database size={18} />, color: '#b84a10', bg: '#fef0e6', keyword: '数据' },
  { key: 'service', label: '产业服务', icon: <Wrench size={18} />, color: '#1a7a45', bg: '#e4f7ed', keyword: '服务' },
];

// ─── 工具函数 ─────────────────────────────────────────────────

function inferIndustryTags(company: Company): string[] {
  const text = `${company.capability} ${company.demand}`;
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
    ['AI', 'AI'],
    ['算力', '算力'],
    ['巡检', '智慧巡检'],
    ['培训', '教育培训'],
    ['检测', '检测认证'],
  ];
  const found: string[] = [];
  for (const [keyword, tag] of tagMap) {
    if (text.includes(keyword) && !found.includes(tag)) {
      found.push(tag);
      if (found.length >= 2) break;
    }
  }
  return found;
}

function extractOneLiner(capability: string): string {
  if (!capability) return '';
  const firstSentence = capability.split(/[。！？\n]/)[0];
  return firstSentence.length > 44 ? firstSentence.slice(0, 44) + '…' : firstSentence;
}

function matchesIndustryKeyword(company: Company, keyword: string): boolean {
  if (!keyword) return true;
  const text = `${company.capability} ${company.demand} ${company.name}`;
  return text.includes(keyword);
}

function getResourcesFromCompanies(keyword: string): Company[] {
  return companies.filter(c => {
    const text = `${c.capability} ${c.demand}`;
    return text.includes(keyword);
  }).slice(0, 3);
}

// ─── 探索南湖地图常量（与 ExplorePage 保持一致）─────────────────

const MAP_IMAGE_URL = 'https://1d-static.alibaba-inc.com/oneday/source/ab44ae18-0e98-4e82-9a3b-54e4b9007eb4.png';
const MAP_IMAGE_ASPECT_RATIO = 8492 / 5097;
const LEASE_FORM_URL = 'https://ams.x.qinspace.com/crm/app-pub/data-collect?id=20';

const BUILDING_LAYOUT: Record<string, { x: number; y: number; open: boolean }> = {
  "1":  { x: 62,   y: 57.5, open: false },
  "2":  { x: 54,   y: 42.5, open: false },
  "3":  { x: 38.1, y: 33,   open: true  },
  "4":  { x: 46.7, y: 25.7, open: true  },
  "5":  { x: 55.5, y: 20,   open: true  },
  "6":  { x: 62.5, y: 20.5, open: true  },
  "7":  { x: 76,   y: 23.3, open: false },
  "8":  { x: 72,   y: 37.5, open: true  },
  "9":  { x: 67,   y: 47.5, open: true  },
  "10": { x: 60.1, y: 69,   open: true  },
  "11": { x: 47.1, y: 61.5, open: true  },
  "12": { x: 35.5, y: 51.3, open: false },
  "13": { x: 26.1, y: 39.7, open: false },
  "14": { x: 28,   y: 56.5, open: false },
  "15": { x: 39.2, y: 67,   open: true  },
  "16": { x: 29.8, y: 71.4, open: false },
};

const EXPLORE_RESOURCE_TABS = [
  { key: 'all',        label: '全部' },
  { key: 'capability', label: '技术/产品' },
  { key: 'demand',     label: '合作需求' },
];

const INDUSTRY_TAG_COLORS: Record<string, { bg: string; color: string }> = {
  'AI':     { bg: '#ede9fe', color: '#6d28d9' },
  '低空经济': { bg: '#e0f2fe', color: '#0369a1' },
  '具身智能': { bg: '#f3e8ff', color: '#7c3aed' },
  '未来医疗': { bg: '#fce7f3', color: '#be185d' },
  '其他':   { bg: '#f1f5f9', color: '#475569' },
};

const AI_KW = ['AI', '人工智能', '大模型', '算法', 'AIGC', '智能体', '机器学习', '深度学习', '视觉', '语音', '自然语言'];
const LOW_KW = ['低空', '无人机', '飞行', '航空', '飞控', '起降', '空域', '航线', '飞手', '旋翼', '固定翼'];
const EMB_KW = ['具身', '机器人', '机械臂', '运动控制', '多智能体', '协同', '巡检机器人'];
const MED_KW = ['医疗', '医学', '健康', '诊断', '手术', '药物', '生物', '基因', '心理'];

function inferExploreTag(company: Company): string {
  const text = `${company.capability} ${company.demand} ${company.name}`.toLowerCase();
  if (EMB_KW.some(kw => text.includes(kw.toLowerCase()))) return '具身智能';
  if (LOW_KW.some(kw => text.includes(kw.toLowerCase()))) return '低空经济';
  if (MED_KW.some(kw => text.includes(kw.toLowerCase()))) return '未来医疗';
  if (AI_KW.some(kw => text.includes(kw.toLowerCase()))) return 'AI';
  return '其他';
}

function extractShortLine(text: string): string {
  if (!text) return '';
  const first = text.split(/[。；！？\n]/)[0];
  return first.length > 60 ? first.slice(0, 60) + '…' : first;
}

// ─── 内嵌探索地图组件 ─────────────────────────────────────────

function InlineExploreMap() {
  const navigate = useNavigate();
  const [resourceTab, setResourceTab] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [connectTarget, setConnectTarget] = useState<ConnectTarget | null>(null);
  const [bouncingBuilding, setBouncingBuilding] = useState<string | null>(null);
  const [lockedBuildingDialog, setLockedBuildingDialog] = useState<string | null>(null);

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
      if (resourceTab === 'capability' && !company.capability) return false;
      if (resourceTab === 'demand' && !company.demand) return false;
      return true;
    });
  }, [resourceTab]);

  const buildingCompanyCount = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCompanies.forEach(c => { map[c.building] = (map[c.building] || 0) + 1; });
    return map;
  }, [filteredCompanies]);

  const buildingsWithCompanies = useMemo(
    () => new Set(filteredCompanies.map(c => c.building)),
    [filteredCompanies]
  );

  const companiesInView = useMemo(() => {
    if (!selectedBuilding) return filteredCompanies;
    return filteredCompanies.filter(c => c.building === selectedBuilding);
  }, [selectedBuilding, filteredCompanies]);

  const handleBuildingClick = useCallback((buildingNo: string) => {
    const layout = BUILDING_LAYOUT[buildingNo];
    if (!layout) return;
    if (!layout.open) {
      setLockedBuildingDialog(buildingNo);
      return;
    }
    if (!buildingsWithCompanies.has(buildingNo)) return;
    setSelectedBuilding(prev => {
      const next = prev === buildingNo ? null : buildingNo;
      if (next) {
        setBouncingBuilding(null);
        requestAnimationFrame(() => setBouncingBuilding(next));
      }
      return next;
    });
  }, [buildingsWithCompanies]);

  return (
    <div>
      <style>{`
        @keyframes hp-pinPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.12); }
        }
        @keyframes hp-labelBounce {
          0% { transform: scale(1); }
          100% { transform: scale(1.18); }
        }
        @media (max-width: 700px) {
          .hp-explore-section {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .hp-explore-map { height: 72vw !important; min-height: 260px !important; max-height: 380px !important; }
          .hp-explore-sidebar {
            height: auto !important;
            max-height: 360px !important;
            overflow-y: auto !important;
            border-left: none !important;
            border-top: 1px solid var(--line) !important;
          }
          .hp-explore-tab-row {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .hp-explore-tab-row > div { flex: 1 1 auto !important; min-width: 0 !important; }
          .hp-explore-tab-row > div button { font-size: 12px !important; padding: 6px 10px !important; }
          .hp-explore-tab-row > button:last-child { flex-shrink: 0 !important; font-size: 12px !important; }
        }
      `}</style>

      {/* 资源 Tab */}
      <div className="hp-explore-tab-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,.6)',
          border: '1px solid var(--line)',
          borderRadius: 14,
          backdropFilter: 'blur(8px)',
          padding: 4,
          flex: '0 0 auto',
        }}>
          {EXPLORE_RESOURCE_TABS.map(tab => {
            const isActive = resourceTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setResourceTab(tab.key); setSelectedBuilding(null); }}
                style={{
                  border: 0,
                  background: isActive ? 'var(--ink)' : 'transparent',
                  color: isActive ? 'white' : 'var(--ink)',
                  borderRadius: 10,
                  padding: '7px 16px',
                  fontSize: 13, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/explore')}
          style={{
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--ink)', borderRadius: 10, padding: '7px 14px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--ink)';
            (e.currentTarget as HTMLElement).style.color = 'white';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
          }}
        >
          进入完整地图 <ExternalLink size={12} />
        </button>
      </div>

      {/* 地图 + 侧边栏 */}
      <section className="hp-explore-section" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        height: 520,
        border: '1px solid var(--line)',
        borderRadius: 20,
        background: '#e8edf4',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>
        {/* 地图 */}
        <div
          className="hp-explore-map"
          ref={mapContainerRef}
          style={{ position: 'relative', overflow: 'hidden', background: '#dde4ee', cursor: 'default' }}
          onClick={() => setSelectedBuilding(null)}
        >
          <img
            src={MAP_IMAGE_URL}
            alt="南湖未来科学园平面示意图"
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center',
              pointerEvents: 'none', userSelect: 'none', zIndex: 1,
            }}
          />

          <div style={{
            position: 'absolute',
            left: imageRect.left, top: imageRect.top,
            width: imageRect.width, height: imageRect.height,
            zIndex: 5,
          }}>
            {Object.entries(BUILDING_LAYOUT).map(([buildingNo, layout]) => {
              const count = buildingCompanyCount[buildingNo] || 0;
              const hasCompanies = layout.open && count > 0;
              const isSelected = selectedBuilding === buildingNo;
              const isDimmed = selectedBuilding !== null && !isSelected;
              const isBouncing = bouncingBuilding === buildingNo;
              const centerX = (layout.x / 100) * imageRect.width;
              const centerY = (layout.y / 100) * imageRect.height;
              const isMobile = imageRect.width > 0 && imageRect.width < 500;

              const pinSize = isSelected ? (isMobile ? 30 : 44) : (isMobile ? 22 : 36);
              const pinWidth = pinSize;
              const pinHeight = Math.round(pinSize * 1.22);
              const r = pinWidth / 2;
              const tailY = pinHeight - r * 0.12;
              const bodyBottom = r + r * 0.62;
              const pinColor = hasCompanies
                ? (isSelected ? '#0d3d8a' : '#1565c0')
                : '#90b8d8';

              return (
                <button
                  key={buildingNo}
                  onClick={e => { e.stopPropagation(); handleBuildingClick(buildingNo); }}
                  style={{
                    position: 'absolute', left: centerX, top: centerY,
                    transform: 'translate(-50%, -50%)',
                    border: 0, background: 'transparent', padding: 0,
                    cursor: 'pointer',
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'opacity 0.22s ease',
                    zIndex: isSelected ? 8 : 6,
                  }}
                  aria-label={`${buildingNo}号楼`}
                >
                  <div
                    onAnimationEnd={() => setBouncingBuilding(null)}
                    style={{
                      position: 'relative', display: 'inline-flex',
                      flexDirection: 'column', alignItems: 'center',
                      animation: isBouncing ? 'hp-labelBounce 0.5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
                      filter: isSelected
                        ? 'drop-shadow(0 6px 14px rgba(0,0,0,.45)) drop-shadow(0 2px 4px rgba(13,61,138,.6))'
                        : (hasCompanies
                            ? 'drop-shadow(0 4px 10px rgba(0,0,0,.3)) drop-shadow(0 2px 5px rgba(21,101,192,.3))'
                            : 'drop-shadow(0 3px 7px rgba(0,0,0,.22))'),
                    }}
                  >
                    <svg width={pinWidth} height={pinHeight} viewBox={`0 0 ${pinWidth} ${pinHeight}`} style={{ display: 'block', overflow: 'visible' }}>
                      <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth={isSelected ? 3.5 : 3} />
                      <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill={pinColor} />
                      <text x={r} y={r + r * 0.08} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={isSelected ? (isMobile ? 15 : 22) : (isMobile ? 11 : 18)} fontWeight="900" fontFamily='"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif' style={{ userSelect: 'none' }}>{buildingNo}</text>
                    </svg>
                    {hasCompanies && (
                      <span style={{
                        position: 'absolute', right: isMobile ? -4 : -6, top: isMobile ? -4 : -6,
                        minWidth: isMobile ? 15 : 20, height: isMobile ? 15 : 20,
                        padding: isMobile ? '0 3px' : '0 4px',
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
                    )}
                    {isSelected && (
                      <svg width={pinWidth + 16} height={pinHeight + 16} viewBox={`${-8} ${-8} ${pinWidth + 16} ${pinHeight + 16}`} style={{ position: 'absolute', top: -8, left: -8, pointerEvents: 'none', zIndex: -1, animation: 'hp-pinPulse 1.8s ease-in-out infinite' }}>
                        <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="rgba(21,101,192,.1)" stroke="rgba(21,101,192,.28)" strokeWidth="3" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 10,
            background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(91,141,184,.2)', borderRadius: 9,
            padding: '6px 11px', fontSize: 11, color: 'var(--muted)',
            boxShadow: '0 2px 10px rgba(0,0,0,.1)',
          }}>
            点击楼栋查看企业
          </div>
        </div>

        {/* 侧边栏 */}
        <aside className="hp-explore-sidebar" style={{
          background: 'var(--cream)',
          borderLeft: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          minWidth: 0, overflow: 'hidden', minHeight: 0,
        }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--lake-deep)', letterSpacing: '0.1em' }}>
                {selectedBuilding ? `${selectedBuilding} 号楼 · 开放资源` : '开放资源企业'}
              </span>
              {selectedBuilding && (
                <button
                  onClick={() => setSelectedBuilding(null)}
                  style={{
                    border: '1px solid var(--line)', background: 'white',
                    color: 'var(--ink)', fontSize: 11, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 7, cursor: 'pointer',
                  }}
                >
                  返回全部
                </button>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              <b style={{
                color: 'var(--ink)', fontSize: 20,
                fontFamily: '"Arial Black", "PingFang SC", sans-serif',
                letterSpacing: '-0.04em',
              }}>
                {companiesInView.length}
              </b>
              {' '}家企业
            </div>
          </div>

          <div style={{ overflowY: 'auto', padding: '10px 14px 16px', flex: 1, minHeight: 0 }}>
            {companiesInView.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)' }}>
                <Search size={24} style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: 12 }}>该楼栋暂无开放资源</p>
              </div>
            ) : (
              companiesInView.map(company => {
                const industryTag = inferExploreTag(company);
                const tagStyle = INDUSTRY_TAG_COLORS[industryTag] || INDUSTRY_TAG_COLORS['其他'];
                return (
                  <article
                    key={company.id}
                    style={{
                      border: '1px solid var(--line)', borderRadius: 12,
                      padding: 11, marginBottom: 8, background: 'white',
                      cursor: 'pointer', transition: '0.18s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.5)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '4px 5px 0 rgba(54,183,173,.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                      (e.currentTarget as HTMLElement).style.transform = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 7 }}>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
                        {company.name}
                      </h3>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 6px',
                        borderRadius: 999, background: tagStyle.bg, color: tagStyle.color,
                        flexShrink: 0,
                      }}>
                        {industryTag}
                      </span>
                    </div>

                    {(resourceTab === 'all' || resourceTab === 'capability') && company.capability && (
                      <div style={{ marginBottom: 7 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 900, color: '#1a7a45',
                          background: '#d4f5e2', display: 'inline-block',
                          padding: '2px 6px', borderRadius: 999, marginBottom: 3,
                        }}>
                          能提供
                        </div>
                        <p style={{
                          margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {extractShortLine(company.capability)}
                        </p>
                      </div>
                    )}

                    {(resourceTab === 'all' || resourceTab === 'demand') && company.demand && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontSize: 9, fontWeight: 900, color: '#b84a10',
                          background: '#fde8d4', display: 'inline-block',
                          padding: '2px 6px', borderRadius: 999, marginBottom: 3,
                        }}>
                          正在寻找
                        </div>
                        <p style={{
                          margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {extractShortLine(company.demand)}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/list', { state: { openCompanyId: company.id } }); }}
                        style={{
                          flex: 1, border: '1px solid #e2e8f0', background: 'white',
                          color: '#1e2d3d', borderRadius: 7, padding: '5px 0',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        查看企业
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setConnectTarget({ companyName: company.name, kind: 'supply', content: company.capability || company.demand || '' });
                        }}
                        style={{
                          flex: 1, border: 0, background: '#1e2d3d', color: 'white',
                          borderRadius: 7, padding: '5px 0',
                          fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        发起对接
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/explore')}
              style={{
                width: '100%', border: '1px solid var(--line)', background: 'white',
                color: 'var(--ink)', borderRadius: 9, padding: '9px 0',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: '0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              <ExternalLink size={12} />
              进入完整探索地图
            </button>
          </div>
        </aside>
      </section>

      {/* 暂未开放弹窗 */}
      {lockedBuildingDialog && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(100,140,180,.32)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLockedBuildingDialog(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 28, padding: '36px 32px 32px', maxWidth: 380, width: 'calc(100% - 48px)', textAlign: 'center', boxShadow: '0 24px 60px rgba(80,120,180,.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f3fb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Building2 size={34} color="#5b8db8" strokeWidth={1.5} />
            </div>
            <div style={{ border: '2px solid #e05a5a', borderRadius: 16, padding: '14px 20px', marginBottom: 16, width: '100%', boxSizing: 'border-box' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1e2d3d' }}>暂无企业合作信息</span>
            </div>
            <p style={{ margin: '0 0 24px', color: '#7a8fa6', fontSize: 13, lineHeight: 1.9 }}>
              如您已是入驻企业，可提交最新信息，让更多园区伙伴发现合作机会；如您有入驻意向，也可留下企业信息，运营人员将第一时间与您对接。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="#/submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: '#a8cce8', color: '#1e3a52', border: 'none', borderRadius: 14, padding: '13px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                提交企业信息
              </a>
              <a href={LEASE_FORM_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'white', color: '#5b8db8', border: '1.5px solid #c8dff0', borderRadius: 14, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                我有入驻意向
              </a>
            </div>
          </div>
        </div>
      )}

      <ConnectModal target={connectTarget} onClose={() => setConnectTarget(null)} />
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [activeIndustry, setActiveIndustry] = useState('all');
  const [activeResource, setActiveResource] = useState('compute');

  const totalCompanies = companies.length;
  const totalWithCapability = useMemo(() => companies.filter(c => c.capability).length, []);

  const filteredCompanies = useMemo(() => {
    const tab = INDUSTRY_TABS.find(t => t.key === activeIndustry);
    const keyword = tab?.keyword ?? '';
    return companies.filter(c => matchesIndustryKeyword(c, keyword)).slice(0, 6);
  }, [activeIndustry]);

  const activeResourceType = RESOURCE_TYPES.find(r => r.key === activeResource) ?? RESOURCE_TYPES[0];
  const resourceCompanies = useMemo(
    () => getResourcesFromCompanies(activeResourceType.keyword),
    [activeResource]
  );

  const handleSearch = (keyword?: string) => {
    const query = keyword ?? searchInput;
    if (!query.trim()) return;
    navigate(`/list?q=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .hp-hero { padding: 80px 40px 60px; }
        .hp-hero-eyebrow { font-size: 13px; }
        .hp-hero-title { font-size: clamp(38px, 5.5vw, 72px); }
        .hp-hero-sub { font-size: 16px; }
        .hp-search-wrap { max-width: 680px; }
        .hp-search-input { height: 62px; }
        .hp-search-btn { height: 62px; padding: 0 30px; }
        .hp-industry-tags { gap: 8px; }
        .hp-stats-bar { padding: 28px 40px; }
        .hp-stats-grid { grid-template-columns: repeat(3, 1fr); }
        .hp-map-wrap { padding: 32px 40px 44px; }

        @media (max-width: 900px) {
          .hp-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .hp-hero { padding: 48px 20px 40px !important; }
          .hp-hero-title { font-size: 32px !important; }
          .hp-hero-sub { font-size: 14px !important; }
          .hp-search-row { flex-direction: column !important; gap: 10px !important; }
          .hp-search-btn { width: 100% !important; justify-content: center !important; height: 52px !important; }
          .hp-search-input { height: 52px !important; }
          .hp-stats-bar { padding: 20px 16px !important; }
          .hp-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .hp-industry-tags { flex-wrap: wrap !important; }
          .hp-map-wrap { padding: 20px 16px 28px !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════
          01 首屏 Hero
      ══════════════════════════════════════════════════════ */}
      <section className="hp-hero" style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>

        {/* 第一层：用途标签 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 16,
          marginBottom: 28,
        }}>
          {[
            { icon: <Building2 size={13} />, label: '找企业' },
            { icon: <Zap size={13} />, label: '找资源' },
            { icon: <LinkIcon size={13} />, label: '找合作' },
          ].map(({ icon, label }, i) => (
            <React.Fragment key={label}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 13, fontWeight: 800, color: 'var(--lake-deep)',
                letterSpacing: '0.04em',
              }}>
                {icon} {label}
              </span>
              {i < 2 && (
                <span style={{ color: 'var(--line)', fontSize: 16, fontWeight: 300 }}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 主标题 */}
        <h1 className="hp-hero-title" style={{
          fontFamily: '"Arial Black", "PingFang SC", sans-serif',
          lineHeight: 1.08,
          letterSpacing: '-0.05em',
          margin: '0 0 18px',
          fontWeight: 900,
        }}>
          看见技术 · 找到伙伴<br />
          <em style={{ color: 'var(--lake-deep)', fontStyle: 'normal' }}>链接产业</em>
        </h1>
        <p className="hp-hero-sub" style={{
          color: 'var(--muted)', lineHeight: 1.75,
          maxWidth: 500, margin: '0 auto 36px',
        }}>
          汇聚南湖园区企业、产业能力与开放资源<br />
          快速发现合作机会
        </p>

        {/* 第三层：搜索框 */}
        <div className="hp-search-wrap" style={{ margin: '0 auto 20px' }}>
          <div className="hp-search-row" style={{ display: 'flex', gap: 10 }}>
            <div
              className="hp-search-input"
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'white',
                border: '1.5px solid var(--line)',
                borderRadius: 18,
                padding: '0 20px',
                boxShadow: '0 8px 32px rgba(30,60,100,.1)',
              }}
            >
              <Search size={20} color="var(--muted)" style={{ flexShrink: 0 }} />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索企业、技术、资源……"
                style={{
                  border: 0, outline: 0, background: 'transparent',
                  width: '100%', fontSize: 15, color: 'var(--ink)',
                }}
              />
            </div>
            <button
              className="hp-search-btn"
              onClick={() => handleSearch()}
              style={{
                background: 'var(--ink)', color: 'white',
                border: 0, borderRadius: 16, fontWeight: 800, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                flexShrink: 0, transition: 'opacity .15s', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              搜索 <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* 产业快速入口 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>按产业探索：</span>
          <div className="hp-industry-tags" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {INDUSTRY_TABS.slice(1).map(({ key, label, icon, color, keyword }) => (
              <button
                key={key}
                onClick={() => navigate(`/list?q=${encodeURIComponent(keyword)}`)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  border: `1px solid ${color}28`,
                  background: `${color}0a`,
                  color,
                  borderRadius: 999, padding: '6px 14px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all .15s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = color;
                  (e.currentTarget as HTMLElement).style.color = 'white';
                  (e.currentTarget as HTMLElement).style.borderColor = color;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = `${color}0a`;
                  (e.currentTarget as HTMLElement).style.color = color;
                  (e.currentTarget as HTMLElement).style.borderColor = `${color}28`;
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          02 南湖正在发生什么
      ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'rgba(255,255,255,.65)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}>
        {/* 数据统计条 */}
        <div className="hp-stats-bar" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="hp-stats-grid" style={{ display: 'grid', gap: 0 }}>
            {[
              { value: '200+', label: '入驻企业', sub: '覆盖多个产业方向', icon: <Users size={18} /> },
              { value: '3', label: '大产业方向', sub: 'AI · 低空经济 · 具身智能', icon: <Layers size={18} /> },
              { value: `${totalWithCapability}+`, label: '开放资源', sub: '可对接 · 可使用 · 可合作', icon: <Package size={18} /> },
            ].map(({ value, label, sub, icon }, index) => (
              <div key={label} style={{
                textAlign: 'center',
                padding: '16px 0',
                borderRight: index < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{ color: 'var(--lake)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                  {icon}
                </div>
                <b style={{
                  display: 'block',
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(26px, 3.2vw, 38px)',
                  fontWeight: 'normal',
                  color: 'var(--ink)',
                  lineHeight: 1.1,
                }}>
                  {value}
                </b>
                <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700, display: 'block', marginTop: 5 }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 探索南湖地图（内嵌交互版） */}
        <div className="hp-map-wrap" style={{ borderTop: '1px solid var(--line)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--lake-deep)', letterSpacing: '0.14em', marginBottom: 8 }}>
              NANHU MAP
            </div>
            <h2 style={{
              fontFamily: '"Arial Black", "PingFang SC", sans-serif',
              fontSize: 'clamp(20px, 2.4vw, 28px)',
              letterSpacing: '-0.04em', margin: '0 0 6px',
            }}>
              探索南湖
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              从地图出发，点击楼栋发现企业与开放资源
            </p>
          </div>
          <InlineExploreMap />
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          底部 CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--ink)', color: 'white',
        padding: '56px 40px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', opacity: 0.4, marginBottom: 14 }}>
            JOIN THE ATLAS
          </div>
          <h2 style={{
            fontFamily: '"Arial Black", "PingFang SC", sans-serif',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            letterSpacing: '-0.04em', margin: '0 0 12px',
          }}>
            让更多人找到你
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, lineHeight: 1.8, margin: '0 0 28px' }}>
            完善企业信息，发布技术能力与合作需求<br />
            让园区内外的产业伙伴主动找上门
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/submit')}
              style={{
                background: 'white', color: 'var(--ink)',
                border: 0, borderRadius: 14, padding: '14px 28px',
                fontWeight: 900, fontSize: 15, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              更新企业名片 <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/list')}
              style={{
                background: 'transparent', color: 'rgba(255,255,255,.7)',
                border: '1px solid rgba(255,255,255,.22)', borderRadius: 14, padding: '14px 24px',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 7,
                transition: 'all .15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)';
                (e.currentTarget as HTMLElement).style.color = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.7)';
              }}
            >
              先浏览资源广场
            </button>
          </div>
        </div>
      </section>

      <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
    </div>
  );
}
