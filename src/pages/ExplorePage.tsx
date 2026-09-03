import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { companies, Company } from '../data/companyData';
import ConnectModal, { ConnectTarget } from '../components/ConnectModal';
import { Search, ExternalLink, Building2 } from 'lucide-react';

const LEASE_FORM_URL = 'https://ams.x.qinspace.com/crm/app-pub/data-collect?id=20';

const MAP_IMAGE_URL = 'https://1d-static.alibaba-inc.com/oneday/source/ab44ae18-0e98-4e82-9a3b-54e4b9007eb4.png';
const MAP_IMAGE_ASPECT_RATIO = 8492 / 5097;

const buildingLayout: Record<string, { x: number; y: number; open: boolean }> = {
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

const RESOURCE_TABS = [
  { key: 'all',        label: '全部' },
  { key: 'capability', label: '技术/产品' },
  { key: 'demand',     label: '合作需求' },
];

const AI_KEYWORDS = ['AI', '人工智能', '大模型', '算法', 'AIGC', '智能体', '机器学习', '深度学习', '视觉', '语音', '自然语言'];
const LOW_ALT_KEYWORDS = ['低空', '无人机', '飞行', '航空', '飞控', '起降', '空域', '航线', '飞手', '旋翼', '固定翼'];
const EMBODIED_KEYWORDS = ['具身', '机器人', '机械臂', '运动控制', '多智能体', '协同', '巡检机器人'];
const MEDICAL_KEYWORDS = ['医疗', '医学', '健康', '诊断', '手术', '药物', '生物', '基因', '心理'];

function inferIndustryTag(company: Company): string {
  const fullText = `${company.capability} ${company.demand} ${company.name}`.toLowerCase();
  if (EMBODIED_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '具身智能';
  if (LOW_ALT_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '低空经济';
  if (MEDICAL_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return '未来医疗';
  if (AI_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()))) return 'AI';
  return '其他';
}

function extractOneLiner(text: string): string {
  if (!text) return '';
  const first = text.split(/[。；！？\n]/)[0];
  return first.length > 60 ? first.slice(0, 60) + '…' : first;
}

const INDUSTRY_TAG_COLORS: Record<string, { bg: string; color: string }> = {
  'AI':     { bg: '#ede9fe', color: '#6d28d9' },
  '低空经济': { bg: '#e0f2fe', color: '#0369a1' },
  '具身智能': { bg: '#f3e8ff', color: '#7c3aed' },
  '未来医疗': { bg: '#fce7f3', color: '#be185d' },
  '其他':   { bg: '#f1f5f9', color: '#475569' },
};

export default function ExplorePage() {
  const navigate = useNavigate();
  const [resourceTab, setResourceTab] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [connectTarget, setConnectTarget] = useState<ConnectTarget | null>(null);
  const [bouncingBuilding, setBouncingBuilding] = useState<string | null>(null);
  const [lockedBuildingDialog, setLockedBuildingDialog] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugPositions, setDebugPositions] = useState<Record<string, { x: number; y: number }>>({});
  const draggingRef = useRef<{ buildingNo: string; startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);

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

  const effectiveLayout = useMemo(() => {
    const result: Record<string, { x: number; y: number; open: boolean }> = {};
    for (const [k, v] of Object.entries(buildingLayout)) {
      result[k] = { ...v, ...(debugPositions[k] ?? {}) };
    }
    return result;
  }, [debugPositions]);

  const handleBuildingClick = useCallback((buildingNo: string) => {
    if (debugMode) return;
    const layout = effectiveLayout[buildingNo];
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
  }, [buildingsWithCompanies, debugMode, effectiveLayout]);

  const handleDragStart = useCallback((e: React.MouseEvent, buildingNo: string) => {
    if (!debugMode) return;
    e.preventDefault();
    e.stopPropagation();
    const current = debugPositions[buildingNo] ?? buildingLayout[buildingNo];
    draggingRef.current = {
      buildingNo,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: current.x,
      startY: current.y,
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = ((ev.clientX - draggingRef.current.startMouseX) / imageRect.width) * 100;
      const dy = ((ev.clientY - draggingRef.current.startMouseY) / imageRect.height) * 100;
      const newX = Math.round((draggingRef.current.startX + dx) * 10) / 10;
      const newY = Math.round((draggingRef.current.startY + dy) * 10) / 10;
      setDebugPositions(prev => ({ ...prev, [draggingRef.current!.buildingNo]: { x: newX, y: newY } }));
    };
    const onMouseUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [debugMode, debugPositions, imageRect.width, imageRect.height]);

  return (
    <div style={{ padding: '20px 20px 34px' }}>
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
          .explore-section {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .explore-map-area { height: 56vw !important; min-height: 220px !important; }
          .explore-sidebar { max-height: 360px !important; overflow-y: auto !important; }
        }
      `}</style>

      {/* 页面标题 */}
      <section style={{ marginBottom: 16 }}>
        <div style={{
          display: 'inline-flex', gap: 8, alignItems: 'center',
          color: 'var(--lake-deep)', fontSize: 11, fontWeight: 800,
          letterSpacing: '0.12em', marginBottom: 8,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--lake)', boxShadow: '0 0 0 5px rgba(54,183,173,.13)',
            display: 'inline-block',
          }} />
          南湖未来科学园 · 持续更新中
        </div>
        <h1 style={{
          fontFamily: '"Arial Black", "PingFang SC", sans-serif',
          margin: '0 0 4px',
          fontSize: 'clamp(22px, 3.5vw, 48px)',
          lineHeight: 1.1,
          letterSpacing: '-0.06em',
        }}>
          探索南湖
        </h1>
        <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
          从地图出发，发现企业与开放资源
        </p>
      </section>

      {/* 调试模式开关 */}
      {debugMode && (
        <div style={{
          marginBottom: 10, padding: '10px 14px',
          background: 'rgba(255,200,0,.12)', border: '1.5px dashed #e6a800',
          borderRadius: 12, fontSize: 12, color: '#7a5800',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span>🔧 <b>坐标调试模式</b>：直接拖动地图上的标记来校准位置，完成后点击「复制坐标」</span>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => {
                const merged = Object.entries(buildingLayout).map(([k, v]) => {
                  const pos = debugPositions[k] ?? v;
                  return `  "${k}": { x: ${pos.x}, y: ${pos.y}, open: ${v.open} }`;
                }).join(',\n');
                navigator.clipboard.writeText(`{\n${merged}\n}`);
                alert('坐标已复制到剪贴板！');
              }}
              style={{
                border: '1px solid #e6a800', background: '#fff8e0', color: '#7a5800',
                borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              复制坐标
            </button>
            <button
              onClick={() => { setDebugMode(false); setDebugPositions({}); }}
              style={{
                border: '1px solid #ccc', background: 'white', color: '#555',
                borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              退出
            </button>
          </div>
        </div>
      )}

      {/* 3个资源 Tab + 调试入口 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{
        display: 'inline-flex', gap: 0,
        background: 'rgba(255,255,255,.6)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        backdropFilter: 'blur(8px)',
        padding: 4,
      }}>
        {RESOURCE_TABS.map(tab => {
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
                padding: '8px 18px',
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
        onClick={() => setDebugMode(v => !v)}
        style={{
          border: '1px solid var(--line)', background: debugMode ? '#fff8e0' : 'transparent',
          color: debugMode ? '#7a5800' : 'var(--muted)',
          borderRadius: 8, padding: '6px 12px',
          fontSize: 11, fontWeight: 700, cursor: 'pointer',
        }}
      >
        {debugMode ? '🔧 调试中' : '校准坐标'}
      </button>
      </div>

      {/* 地图 + 侧边栏 */}
      <section className="explore-section" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        height: 600,
        border: '1px solid var(--line)',
        borderRadius: 24,
        background: '#e8edf4',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>
        {/* 地图区域 */}
        <div
          className="explore-map-area"
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
            {Object.entries(effectiveLayout).map(([buildingNo, layout]) => {
              const count = buildingCompanyCount[buildingNo] || 0;
              const hasCompanies = layout.open && count > 0;
              const isSelected = selectedBuilding === buildingNo;
              const isDimmed = selectedBuilding !== null && !isSelected;
              const isBouncing = bouncingBuilding === buildingNo;

              const centerX = (layout.x / 100) * imageRect.width;
              const centerY = (layout.y / 100) * imageRect.height;
              const isMobile = imageRect.width > 0 && imageRect.width < 500;

              if (!hasCompanies) {
                const pinSize = isMobile ? 22 : 36;
                const pinWidth = pinSize;
                const pinHeight = Math.round(pinSize * 1.22);
                const r = pinWidth / 2;
                const tailY = pinHeight - r * 0.12;
                const bodyBottom = r + r * 0.62;
                const pinColor = debugMode ? '#f59e0b' : '#90b8d8';
                const pinOpacity = isDimmed ? 0.3 : 1;

                return (
                  <button key={buildingNo}
                    onMouseDown={e => handleDragStart(e, buildingNo)}
                    onClick={e => { e.stopPropagation(); handleBuildingClick(buildingNo); }}
                    style={{
                      position: 'absolute', left: centerX, top: centerY,
                      transform: 'translate(-50%, -50%)',
                      border: 0, background: 'transparent', padding: 0,
                      cursor: debugMode ? 'grab' : 'pointer',
                      opacity: pinOpacity,
                      transition: 'opacity 0.22s ease',
                      zIndex: 4,
                    }}
                    aria-label={`${buildingNo}号楼，暂未开放`}
                  >
                    <div style={{
                      position: 'relative', display: 'inline-flex',
                      flexDirection: 'column', alignItems: 'center',
                      filter: 'drop-shadow(0 3px 7px rgba(0,0,0,.22))',
                    }}>
                      <svg width={pinWidth} height={pinHeight} viewBox={`0 0 ${pinWidth} ${pinHeight}`} style={{ display: 'block', overflow: 'visible' }}>
                        <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={2.5} />
                        <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill={pinColor} />
                        <text x={r} y={r + r * 0.08} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={isMobile ? 11 : 18} fontWeight="900" fontFamily='"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif' style={{ userSelect: 'none' }}>{buildingNo}</text>
                      </svg>
                    </div>
                  </button>
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
                <button
                  key={buildingNo}
                  onMouseDown={e => handleDragStart(e, buildingNo)}
                  onClick={e => { e.stopPropagation(); handleBuildingClick(buildingNo); }}
                  style={{
                    position: 'absolute', left: centerX, top: centerY,
                    transform: 'translate(-50%, -50%)',
                    border: 0, background: 'transparent', padding: 0,
                    cursor: debugMode ? 'grab' : 'pointer',
                    opacity: isDimmed ? 0.4 : 1,
                    transition: 'opacity 0.22s ease',
                    zIndex: isSelected ? 8 : 6,
                  }}
                  aria-label={`${buildingNo}号楼，${count}家企业`}
                >
                  <div
                    onAnimationEnd={() => setBouncingBuilding(null)}
                    style={{
                      position: 'relative', display: 'inline-flex',
                      flexDirection: 'column', alignItems: 'center',
                      animation: isBouncing ? 'labelBounce 0.5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
                      filter: isSelected
                        ? 'drop-shadow(0 6px 14px rgba(0,0,0,.45)) drop-shadow(0 2px 4px rgba(13,61,138,.6))'
                        : 'drop-shadow(0 4px 10px rgba(0,0,0,.3)) drop-shadow(0 2px 5px rgba(21,101,192,.3))',
                    }}
                  >
                    <svg width={pinWidth} height={pinHeight} viewBox={`0 0 ${pinWidth} ${pinHeight}`} style={{ display: 'block', overflow: 'visible' }}>
                      <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill="none" stroke="rgba(255,255,255,.95)" strokeWidth={isSelected ? 3.5 : 3} />
                      <path d={`M ${r} ${tailY} C ${r * 0.55} ${bodyBottom + r * 0.18}, ${pinWidth * 0.04} ${r * 1.55}, ${pinWidth * 0.04} ${r} A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r} C ${pinWidth * 0.96} ${r * 1.55}, ${r * 1.45} ${bodyBottom + r * 0.18}, ${r} ${tailY} Z`} fill={pinColor} />
                      <text x={r} y={r + r * 0.08} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={isSelected ? (isMobile ? 15 : 22) : (isMobile ? 11 : 18)} fontWeight="900" fontFamily='"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif' style={{ userSelect: 'none' }}>{buildingNo}</text>
                    </svg>
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

          <div style={{
            position: 'absolute', bottom: 14, left: 14, zIndex: 10,
            background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(91,141,184,.2)', borderRadius: 10,
            padding: '7px 12px', fontSize: 11, color: 'var(--muted)',
            boxShadow: '0 2px 10px rgba(0,0,0,.1)',
          }}>
            点击楼栋查看企业，持续更新中
          </div>
        </div>

        {/* 侧边栏 */}
        <aside className="explore-sidebar" style={{
          background: 'var(--cream)',
          borderLeft: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column',
          minWidth: 0, overflow: 'hidden', minHeight: 0,
        }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--lake-deep)', letterSpacing: '0.1em' }}>
                {selectedBuilding ? `${selectedBuilding} 号楼 · 开放资源` : '开放资源企业'}
              </span>
              {selectedBuilding && (
                <button
                  onClick={() => setSelectedBuilding(null)}
                  style={{
                    border: '1px solid var(--line)', background: 'white',
                    color: 'var(--ink)', fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  返回全部
                </button>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              <b style={{
                color: 'var(--ink)', fontSize: 22,
                fontFamily: '"Arial Black", "PingFang SC", sans-serif',
                letterSpacing: '-0.04em',
              }}>
                {companiesInView.length}
              </b>
              {' '}家企业
            </div>
          </div>

          <div style={{ overflowY: 'auto', padding: '12px 16px 20px', flex: 1, minHeight: 0 }}>
            {companiesInView.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <Search size={28} style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontSize: 13 }}>该楼栋暂无开放资源</p>
              </div>
            ) : (
              companiesInView.map(company => {
                const industryTag = inferIndustryTag(company);
                const tagStyle = INDUSTRY_TAG_COLORS[industryTag] || INDUSTRY_TAG_COLORS['其他'];
                return (
                  <article
                    key={company.id}
                    style={{
                      border: '1px solid var(--line)', borderRadius: 14,
                      padding: 13, marginBottom: 9, background: 'white',
                      cursor: 'pointer', transition: '0.18s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.5)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(-2px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '5px 6px 0 rgba(54,183,173,.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                      (e.currentTarget as HTMLElement).style.transform = '';
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.4, flex: 1 }}>
                        {company.name}
                      </h3>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 7px',
                        borderRadius: 999, background: tagStyle.bg, color: tagStyle.color,
                        flexShrink: 0,
                      }}>
                        {industryTag}
                      </span>
                    </div>

                    {(resourceTab === 'all' || resourceTab === 'capability') && company.capability && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 900, color: '#1a7a45',
                          background: '#d4f5e2', display: 'inline-block',
                          padding: '2px 7px', borderRadius: 999, marginBottom: 4,
                          letterSpacing: '0.04em',
                        }}>
                          能提供
                        </div>
                        <p style={{
                          margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {extractOneLiner(company.capability)}
                        </p>
                      </div>
                    )}

                    {(resourceTab === 'all' || resourceTab === 'demand') && company.demand && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{
                          fontSize: 10, fontWeight: 900, color: '#b84a10',
                          background: '#fde8d4', display: 'inline-block',
                          padding: '2px 7px', borderRadius: 999, marginBottom: 4,
                          letterSpacing: '0.04em',
                        }}>
                          正在寻找
                        </div>
                        <p style={{
                          margin: 0, fontSize: 11, color: '#374151', lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {extractOneLiner(company.demand)}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/list', { state: { openCompanyId: company.id } }); }}
                        style={{
                          flex: 1, border: '1px solid #e2e8f0', background: 'white',
                          color: '#1e2d3d', borderRadius: 8, padding: '6px 0',
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
                          borderRadius: 8, padding: '6px 0',
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

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
            <button
              onClick={() => navigate('/list')}
              style={{
                width: '100%', border: '1px solid var(--line)', background: 'white',
                color: 'var(--ink)', borderRadius: 10, padding: '10px 0',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: '0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              <ExternalLink size={13} />
              查看全部资源
            </button>
          </div>
        </aside>
      </section>

      <ConnectModal target={connectTarget} onClose={() => setConnectTarget(null)} />

      {lockedBuildingDialog && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(100,140,180,.32)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLockedBuildingDialog(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 28, padding: '36px 32px 32px', maxWidth: 380, width: 'calc(100% - 48px)', textAlign: 'center', boxShadow: '0 24px 60px rgba(80,120,180,.18)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* 楼栋图标 */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f3fb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Building2 size={34} color="#5b8db8" strokeWidth={1.5} />
            </div>

            {/* 标题框 */}
            <div style={{
              borderRadius: 16,
              padding: '14px 20px',
              marginBottom: 16,
              display: 'inline-block',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1e2d3d', letterSpacing: '-0.01em' }}>
                暂无企业合作信息
              </span>
            </div>

            <p style={{ margin: '0 0 24px', color: '#7a8fa6', fontSize: 13, lineHeight: 1.9 }}>
              如您已是入驻企业，可提交最新信息，让更多园区伙伴发现合作机会；如您有入驻意向，也可留下企业信息，运营人员将第一时间与您对接。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <a
                href="#/submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: '#a8cce8', color: '#1e3a52', border: 'none', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease', boxSizing: 'border-box' }}
                onMouseEnter={e => { (e.currentTarget.style.background = '#8fbedd'); }}
                onMouseLeave={e => { (e.currentTarget.style.background = '#a8cce8'); }}
              >
                提交企业信息
              </a>
              <a
                href={LEASE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'white', color: '#5b8db8', border: '1.5px solid #c8dff0', borderRadius: 14, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease', boxSizing: 'border-box' }}
                onMouseEnter={e => { (e.currentTarget.style.background = '#f0f7fd'); }}
                onMouseLeave={e => { (e.currentTarget.style.background = 'white'); }}
              >
                我有入驻意向
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
