import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { companies, buildingColors, Company } from '../data/companyData';
import CompanyModal from '../components/CompanyModal';
import { Search, Lock, LayoutGrid, Building2, Move } from 'lucide-react';

const LEASE_FORM_URL = 'https://ams.x.qinspace.com/crm/app-pub/data-collect?id=20';
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

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    regex.test(part)
      ? <mark key={index} style={{ background: 'rgba(255,200,60,.45)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{part}</mark>
      : part
  );
}

type SelectedBuilding = string | null;

export default function MapPageNew() {
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [lockedBuildingDialog, setLockedBuildingDialog] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [bouncingBuilding, setBouncingBuilding] = useState<string | null>(null);
  const [debugOverrides, setDebugOverrides] = useState<Record<string, { x: number; y: number }>>({});
  const draggingRef = useRef<{ buildingNo: string; startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);

  const listScrollRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const buildingCompanyCount = useMemo(() => {
    const countMap: Record<string, number> = {};
    companies.forEach(c => { countMap[c.building] = (countMap[c.building] || 0) + 1; });
    return countMap;
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const inBuilding = selectedBuilding === null || c.building === selectedBuilding;
      const hit = !searchQuery || `${c.name}${c.capability}${c.demand}`.toLowerCase().includes(searchQuery.toLowerCase());
      return inBuilding && hit;
    });
  }, [selectedBuilding, searchQuery]);

  const isOverviewMode = selectedBuilding === null;
  const currentLayout = selectedBuilding ? buildingLayout[selectedBuilding] : null;

  useEffect(() => {
    if (listScrollRef.current) listScrollRef.current.scrollTop = 0;
  }, [selectedBuilding]);

  const recalculateImageRect = useCallback(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerAspect = containerWidth / containerHeight;

    let imageWidth: number;
    let imageHeight: number;

    if (containerAspect > MAP_IMAGE_ASPECT_RATIO) {
      imageHeight = containerHeight;
      imageWidth = containerHeight * MAP_IMAGE_ASPECT_RATIO;
    } else {
      imageWidth = containerWidth;
      imageHeight = containerWidth / MAP_IMAGE_ASPECT_RATIO;
    }

    setImageRect({
      left: (containerWidth - imageWidth) / 2,
      top: (containerHeight - imageHeight) / 2,
      width: imageWidth,
      height: imageHeight,
    });
  }, []);

  useEffect(() => {
    recalculateImageRect();
    const observer = new ResizeObserver(recalculateImageRect);
    if (mapContainerRef.current) observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [recalculateImageRect]);

  useEffect(() => {
    if (!debugMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dragging = draggingRef.current;
      if (!dragging || imageRect.width === 0) return;
      const deltaX = e.clientX - dragging.startMouseX;
      const deltaY = e.clientY - dragging.startMouseY;
      const newX = Math.max(0, Math.min(100, dragging.startX + (deltaX / imageRect.width) * 100));
      const newY = Math.max(0, Math.min(100, dragging.startY + (deltaY / imageRect.height) * 100));
      setDebugOverrides(prev => ({
        ...prev,
        [dragging.buildingNo]: {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        },
      }));
    };

    const handleMouseUp = () => { draggingRef.current = null; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [debugMode, imageRect]);

  const handleBuildingClick = useCallback((buildingNo: string, isOpen: boolean) => {
    if (debugMode) return;
    if (!isOpen) { setLockedBuildingDialog(buildingNo); return; }
    setSelectedBuilding(prev => {
      const nextBuilding = prev === buildingNo ? null : buildingNo;
      if (nextBuilding) {
        setBouncingBuilding(null);
        requestAnimationFrame(() => setBouncingBuilding(nextBuilding));
      }
      return nextBuilding;
    });
  }, [debugMode]);

  const handleMapBackgroundClick = useCallback(() => {
    if (selectedBuilding !== null) setSelectedBuilding(null);
  }, [selectedBuilding]);

  const exportCoordinates = useCallback(() => {
    const lines = Object.entries(buildingLayout).map(([no, layout]) => {
      const override = debugOverrides[no];
      const x = override ? override.x : layout.x;
      const y = override ? override.y : layout.y;
      return `  "${no}":  { x: ${x}, y: ${y}, open: ${layout.open} },`;
    });
    return lines.join('\n');
  }, [debugOverrides]);

  const panelTitle = isOverviewMode ? '全园区总览' : `${selectedBuilding} 号楼`;
  const panelSubtitle = isOverviewMode ? 'ALL BUILDINGS' : 'BUILDING DOSSIER';
  const panelCount = isOverviewMode
    ? `${filteredCompanies.length} 家企业`
    : (currentLayout?.open ? `${filteredCompanies.length} 家企业` : '暂未开放');

  return (
    <div style={{ padding: '20px 20px 34px' }}>
      <style>{`
        @media (max-width: 700px) {
          .map-hero-title { font-size: 28px !important; }
          .map-hero-desc { display: none !important; }
          .map-hero-stats { gap: 8px !important; }
          .map-hero-stat { padding: 12px !important; }
          .map-hero-stat b { font-size: 22px !important; }
          .map-main-section {
            grid-template-columns: 1fr !important;
            grid-template-rows: 52vw auto !important;
            height: auto !important;
          }
          .map-panel-aside {
            border-left: none !important;
            border-top: 1px solid var(--line) !important;
            max-height: 420px !important;
          }
        }
        @media (max-width: 480px) {
          .map-page-wrap { padding: 12px 12px 24px !important; }
          .map-hero-section { margin-bottom: 12px !important; }
        }
      `}</style>

      <section className="map-hero-section" style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '4px 0 16px' }}>
        <div>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--lake-deep)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lake)', boxShadow: '0 0 0 6px rgba(54,183,173,.13)', display: 'inline-block' }} />
            园区能力实时索引 · 2026
          </div>
          <h1 className="map-hero-title" style={{ fontFamily: '"Arial Black", "PingFang SC", sans-serif', margin: '10px 0 6px', fontSize: 'clamp(28px, 4.3vw, 66px)', lineHeight: 1.1, letterSpacing: '-0.07em' }}>
            让每一栋楼<br />成为一张<em style={{ color: 'var(--lake-deep)', fontStyle: 'normal' }}>连接入口</em>
          </h1>
          <p className="map-hero-desc" style={{ maxWidth: 610, color: 'var(--muted)', lineHeight: 1.9, fontSize: 14, margin: '10px 0 0' }}>
            从楼栋进入企业档案，快速发现园区内正在寻找的资源与可开放的技术能力。
          </p>
        </div>
        <div className="map-hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 320 }}>
          {[
            { value: companies.length, label: '已收录企业' },
            { value: Object.keys(buildingLayout).filter(k => buildingLayout[k].open).length, label: '开放楼栋' },
          ].map(({ value, label }) => (
            <div key={label} className="map-hero-stat" style={{ padding: 17, borderTop: '1px solid var(--ink)', background: 'rgba(255,255,255,.36)' }}>
              <b style={{ display: 'block', fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 'normal' }}>{value}</b>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="map-main-section" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 385px',
        height: 680,
        border: '1px solid var(--line)',
        borderRadius: 28,
        background: '#e8edf4',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>
        <div
          ref={mapContainerRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#dde4ee',
            cursor: debugMode ? 'default' : (selectedBuilding ? 'pointer' : 'default'),
          }}
          onClick={handleMapBackgroundClick}
        >
          <img
            src={MAP_IMAGE_URL}
            alt="南湖未来科学园平面图"
            style={{
              position: 'absolute',
              top: 60,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 'calc(100% - 60px)',
              objectFit: 'contain',
              objectPosition: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
            }}
          />

          <div
            style={{
              position: 'absolute', left: 16, right: 16, top: 14, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 10,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              background: 'rgba(255,255,255,.88)', border: '1px solid rgba(91,141,184,.2)',
              borderRadius: 13, padding: '9px 14px',
              boxShadow: '0 4px 18px rgba(91,141,184,.14)',
              backdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}>
              <b style={{ display: 'block', fontSize: 12, color: 'var(--ink)' }}>南湖未来科学园 · 企业分布总览</b>
              <span style={{ color: 'var(--muted)', fontSize: 10 }}>
                {debugMode ? '调试模式：拖动标签调整位置' : (selectedBuilding ? '再次点击楼栋或点击空白处，返回总览' : '点击楼栋，打开企业能力档案')}
              </span>
            </div>
            <div style={{
              flex: 1, height: 42,
              border: '1px solid rgba(91,141,184,.28)', borderRadius: 13,
              background: 'rgba(255,255,255,.88)',
              display: 'flex', alignItems: 'center', padding: '0 13px', gap: 9,
              boxShadow: '0 4px 16px rgba(91,141,184,.12)',
              backdropFilter: 'blur(8px)',
            }}>
              <Search size={14} color="var(--muted)" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索企业、技术能力或资源需求…"
                style={{ border: 0, outline: 0, background: 'transparent', width: '100%', color: 'var(--ink)', fontSize: 13 }}
              />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              left: imageRect.left,
              top: imageRect.top,
              width: imageRect.width,
              height: imageRect.height,
              zIndex: 5,
            }}
          >
            {debugMode && (
              <>
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`h${i}`} style={{
                    position: 'absolute', left: 0, right: 0,
                    top: `${i * 10}%`, height: 1,
                    background: i % 5 === 0 ? 'rgba(255,0,0,.5)' : 'rgba(255,0,0,.2)',
                    pointerEvents: 'none', zIndex: 20,
                  }}>
                    {i > 0 && i < 10 && (
                      <span style={{ position: 'absolute', left: 2, top: -10, fontSize: 9, color: 'red', fontWeight: 700, background: 'rgba(255,255,255,.7)', padding: '0 2px' }}>
                        y={i * 10}
                      </span>
                    )}
                  </div>
                ))}
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`v${i}`} style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${i * 10}%`, width: 1,
                    background: i % 5 === 0 ? 'rgba(255,0,0,.5)' : 'rgba(255,0,0,.2)',
                    pointerEvents: 'none', zIndex: 20,
                  }}>
                    {i > 0 && i < 10 && (
                      <span style={{ position: 'absolute', top: 2, left: 2, fontSize: 9, color: 'red', fontWeight: 700, background: 'rgba(255,255,255,.7)', padding: '0 2px' }}>
                        x={i * 10}
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            {Object.entries(buildingLayout).map(([buildingNo, layout]) => {
              const count = buildingCompanyCount[buildingNo] || 0;
              const isSelected = selectedBuilding === buildingNo;
              const isDimmed = selectedBuilding !== null && !isSelected;
              const hasCompanies = layout.open && count > 0;
              const isBouncing = bouncingBuilding === buildingNo;

              const override = debugOverrides[buildingNo];
              const coordX = override ? override.x : layout.x;
              const coordY = override ? override.y : layout.y;

              const centerX = (coordX / 100) * imageRect.width;
              const centerY = (coordY / 100) * imageRect.height;

              return (
                <button
                  key={buildingNo}
                  onMouseDown={debugMode ? (e => {
                    e.stopPropagation();
                    e.preventDefault();
                    draggingRef.current = {
                      buildingNo,
                      startMouseX: e.clientX,
                      startMouseY: e.clientY,
                      startX: coordX,
                      startY: coordY,
                    };
                  }) : undefined}
                  onClick={e => {
                    e.stopPropagation();
                    handleBuildingClick(buildingNo, layout.open);
                  }}
                  style={{
                    position: 'absolute',
                    left: centerX,
                    top: centerY,
                    transform: 'translate(-50%, -50%)',
                    border: 0,
                    background: 'transparent',
                    padding: 0,
                    cursor: debugMode ? 'grab' : (layout.open ? 'pointer' : 'not-allowed'),
                    opacity: (!debugMode && isDimmed) ? 0.45 : 1,
                    transition: 'opacity 0.22s ease',
                    zIndex: isSelected ? 8 : 6,
                  }}
                  aria-label={`${buildingNo}号楼，${layout.open ? count + '家企业' : '暂未开放'}`}
                >
                  {debugMode && (
                    <div style={{
                      position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,.8)', color: '#fff',
                      fontSize: 9, padding: '2px 5px', borderRadius: 4,
                      whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 30,
                      marginBottom: 3,
                    }}>
                      {buildingNo}: x={coordX} y={coordY}
                    </div>
                  )}

                  {(() => {
                    const pinColor = debugMode
                      ? '#7b1fa2'
                      : (isSelected ? '#0d3d8a' : (hasCompanies ? '#1565c0' : '#6fa8d6'));
                    const pinSize = isSelected ? 47 : 38;
                    const pinWidth = pinSize;
                    const pinHeight = Math.round(pinSize * 1.22);
                    const r = pinWidth / 2;
                    const tailY = pinHeight - r * 0.12;
                    const bodyBottom = r + r * 0.62;

                    return (
                      <div
                        onAnimationEnd={() => setBouncingBuilding(null)}
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          animation: isBouncing ? 'labelBounce 0.5s cubic-bezier(.34,1.56,.64,1) forwards' : 'none',
                          filter: isSelected
                            ? `drop-shadow(0 6px 14px rgba(0,0,0,.45)) drop-shadow(0 2px 4px rgba(13,61,138,.6))`
                            : (hasCompanies
                                ? 'drop-shadow(0 4px 10px rgba(0,0,0,.35)) drop-shadow(0 2px 5px rgba(21,101,192,.35))'
                                : 'drop-shadow(0 3px 7px rgba(0,0,0,.28))'),
                        }}
                      >
                        <svg
                          width={pinWidth}
                          height={pinHeight}
                          viewBox={`0 0 ${pinWidth} ${pinHeight}`}
                          style={{ display: 'block', overflow: 'visible' }}
                        >
                          {/* 圆润 pin 形：上半圆 + 两侧平滑收拢到底部尖点 */}
                          {/* 白色描边层（始终显示，让 pin 在底图上清晰"抠"出来） */}
                          <path
                            d={`
                              M ${r} ${tailY}
                              C ${r * 0.55} ${bodyBottom + r * 0.18},
                                ${pinWidth * 0.04} ${r * 1.55},
                                ${pinWidth * 0.04} ${r}
                              A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r}
                              C ${pinWidth * 0.96} ${r * 1.55},
                                ${r * 1.45} ${bodyBottom + r * 0.18},
                                ${r} ${tailY}
                              Z
                            `}
                            fill="none"
                            stroke="rgba(255,255,255,.95)"
                            strokeWidth={isSelected ? 3.5 : 3}
                          />
                          {/* 主体填色 */}
                          <path
                            d={`
                              M ${r} ${tailY}
                              C ${r * 0.55} ${bodyBottom + r * 0.18},
                                ${pinWidth * 0.04} ${r * 1.55},
                                ${pinWidth * 0.04} ${r}
                              A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r}
                              C ${pinWidth * 0.96} ${r * 1.55},
                                ${r * 1.45} ${bodyBottom + r * 0.18},
                                ${r} ${tailY}
                              Z
                            `}
                            fill={pinColor}
                          />
                          {isSelected && (
                            <path
                              d={`
                                M ${r} ${tailY}
                                C ${r * 0.55} ${bodyBottom + r * 0.18},
                                  ${pinWidth * 0.04} ${r * 1.55},
                                  ${pinWidth * 0.04} ${r}
                                A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r}
                                C ${pinWidth * 0.96} ${r * 1.55},
                                  ${r * 1.45} ${bodyBottom + r * 0.18},
                                  ${r} ${tailY}
                                Z
                              `}
                              fill="none"
                              stroke="rgba(255,255,255,.55)"
                              strokeWidth="2"
                            />
                          )}
                          <text
                            x={r}
                            y={r + r * 0.08}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#fff"
                            fontSize={isSelected ? 24 : 20}
                            fontWeight="900"
                            fontFamily='"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif'
                            style={{ userSelect: 'none' }}
                          >
                            {buildingNo}
                          </text>
                        </svg>

                        {/* 企业数量角标 */}
                        {hasCompanies && !debugMode && (
                          <span style={{
                            position: 'absolute', right: -7, top: -7,
                            minWidth: 22, height: 22, padding: '0 5px',
                            borderRadius: 999,
                            background: isSelected
                              ? 'linear-gradient(135deg, #ff8c00, #f05a00)'
                              : 'linear-gradient(135deg, #ff9a1a, #e85d00)',
                            border: '2.5px solid rgba(255,255,255,.98)',
                            display: 'grid', placeItems: 'center',
                            color: '#fff', fontSize: 11, fontWeight: 900,
                            boxShadow: '0 2px 8px rgba(220,90,0,.45)',
                            lineHeight: 1,
                            transition: 'all 0.22s ease',
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            letterSpacing: '-0.02em',
                            fontFamily: '"Nunito","Varela Round","PingFang SC",sans-serif',
                          }}>
                            {count}
                          </span>
                        )}

                        {/* 选中脉冲光晕：与 pin 同形 SVG */}
                        {isSelected && !debugMode && (
                          <svg
                            width={pinWidth + 16}
                            height={pinHeight + 16}
                            viewBox={`${-8} ${-8} ${pinWidth + 16} ${pinHeight + 16}`}
                            style={{
                              position: 'absolute',
                              top: -8, left: -8,
                              pointerEvents: 'none',
                              zIndex: -1,
                              animation: 'pinPulse 1.8s ease-in-out infinite',
                            }}
                          >
                            <path
                              d={`
                                M ${r} ${tailY}
                                C ${r * 0.55} ${bodyBottom + r * 0.18},
                                  ${pinWidth * 0.04} ${r * 1.55},
                                  ${pinWidth * 0.04} ${r}
                                A ${r - pinWidth * 0.04} ${r - pinWidth * 0.04} 0 1 1 ${pinWidth * 0.96} ${r}
                                C ${pinWidth * 0.96} ${r * 1.55},
                                  ${r * 1.45} ${bodyBottom + r * 0.18},
                                  ${r} ${tailY}
                                Z
                              `}
                              fill="rgba(21,101,192,.12)"
                              stroke="rgba(21,101,192,.3)"
                              strokeWidth="3"
                            />
                          </svg>
                        )}
                      </div>
                    );
                  })()}
                </button>
              );
            })}
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');
            @keyframes pinPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.12); }
            }
            @keyframes badgePop {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1.15); opacity: 1; }
            }
            @keyframes labelBounce {
              0%   { transform: scale(1); }
              100% { transform: scale(1.18); }
            }
          `}</style>

          <button
            onClick={e => {
              e.stopPropagation();
              setDebugMode(prev => {
                if (prev) setDebugOverrides({});
                return !prev;
              });
            }}
            style={{
              position: 'absolute', bottom: 14, right: 14, zIndex: 15,
              background: debugMode ? 'rgba(123,31,162,.9)' : 'rgba(255,255,255,.75)',
              border: '1px solid rgba(0,0,0,.15)',
              borderRadius: 8, padding: '5px 10px',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              color: debugMode ? '#fff' : '#555',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 2px 8px rgba(0,0,0,.12)',
              transition: '0.15s ease',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <Move size={11} />
            {debugMode ? '退出调试' : '调试坐标'}
          </button>

          {debugMode && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', bottom: 50, right: 14, zIndex: 15,
                background: 'rgba(20,10,30,.92)',
                border: '1px solid rgba(180,100,255,.3)',
                borderRadius: 10, padding: '10px 12px',
                maxWidth: 260, maxHeight: 200, overflowY: 'auto',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0,0,0,.4)',
              }}
            >
              <div style={{ color: 'rgba(200,150,255,.9)', fontSize: 9, fontWeight: 700, marginBottom: 6, letterSpacing: '0.08em' }}>
                拖动标签调整位置 · 当前坐标
              </div>
              <pre style={{ margin: 0, fontSize: 9, color: '#c8f0c8', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {exportCoordinates()}
              </pre>
            </div>
          )}
        </div>

        <aside className="map-panel-aside" style={{
          background: 'var(--cream)',
          borderLeft: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
          minHeight: 0,
        }}>
          <div style={{ padding: '23px 23px 16px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: 'var(--lake-deep)', fontSize: 11, fontWeight: 900, letterSpacing: '0.12em' }}>
                {panelSubtitle}
              </div>
              {isOverviewMode ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: 'var(--lake-deep)', background: '#e5f5f0', padding: '4px 9px', borderRadius: 999 }}>
                  <LayoutGrid size={11} />全部楼栋
                </span>
              ) : (
                <button
                  onClick={() => setSelectedBuilding(null)}
                  style={{ border: '1px solid var(--line)', background: 'white', color: 'var(--ink)', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: '0.15s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.5)'; (e.currentTarget as HTMLElement).style.color = 'var(--lake-deep)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
                >
                  <LayoutGrid size={11} />返回总览
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 15, marginTop: 8 }}>
              <h2 style={{ margin: 0, fontFamily: '"Arial Black", "PingFang SC", sans-serif', fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em' }}>
                {panelTitle}
              </h2>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{panelCount}</span>
            </div>
          </div>

          {searchQuery && filteredCompanies.length > 0 && (
            <div style={{ padding: '8px 22px', background: 'rgba(255,200,60,.12)', borderBottom: '1px solid rgba(255,200,60,.25)', fontSize: 11, color: '#7a5c00', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, background: 'rgba(255,200,60,.7)', borderRadius: 2 }} />
              已高亮显示「{searchQuery}」的匹配内容
            </div>
          )}

          <div ref={listScrollRef} style={{ overflowY: 'auto', overflowX: 'hidden', padding: '13px 18px 22px', flex: 1, minHeight: 0 }}>
            {!isOverviewMode && !currentLayout?.open ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(144,196,232,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Lock size={22} color="#5b8db8" strokeWidth={1.8} />
                </div>
                <b style={{ display: 'block', color: 'var(--ink)', fontSize: 15, marginBottom: 10 }}>该楼栋暂未开放</b>
                <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: 12, lineHeight: 1.8 }}>
                  如您已是入驻企业，可提交最新信息，让更多园区伙伴发现合作机会；如您有入驻意向，也可留下企业信息，运营人员将第一时间与您对接。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, width: '100%' }}>
                  <a
                    href="#/submit"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--orange)', color: '#342219', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    提交企业信息
                  </a>
                  <a
                    href={LEASE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', color: '#5b8db8', border: '1px solid #c8dff0', borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease' }}
                    onMouseEnter={e => { (e.currentTarget.style.background = '#f0f7fd'); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = 'white'); }}
                  >
                    我有入驻意向
                  </a>
                </div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--muted)', padding: 35 }}>
                <div>
                  <Search size={30} style={{ margin: '0 auto 10px' }} />
                  <b style={{ display: 'block', color: 'var(--ink)', fontSize: 16, marginBottom: 5 }}>暂未找到匹配企业</b>
                  <span>试试清空搜索或切换筛选条件</span>
                </div>
              </div>
            ) : (
              filteredCompanies.map(company => (
                <article
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 15, marginBottom: 10, background: 'white', cursor: 'pointer', transition: '0.18s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '7px 8px 0 rgba(54,183,173,.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 15, lineHeight: 1.35, fontWeight: 700 }}>
                      {highlightText(company.name, searchQuery)}
                    </h3>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                      {isOverviewMode && company.building && company.building !== '-' && (
                        <span style={{ font: '10px monospace', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #5b8db8, #2d5f8a)', padding: '4px 6px', borderRadius: 5, boxShadow: '0 2px 6px rgba(45,95,138,.3)' }}>
                          {company.building}＃
                        </span>
                      )}
                    </div>
                  </div>
                  {company.capability && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 6px', borderRadius: 999, background: 'linear-gradient(135deg, #d4f5e2, #b8ecd0)', color: '#1a7a45', letterSpacing: '0.04em', boxShadow: '0 1px 4px rgba(26,122,69,.15)' }}>可提供</span>
                      </div>
                      <p style={{ margin: 0, color: '#536966', fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {highlightText(company.capability, searchQuery)}
                      </p>
                    </div>
                  )}
                  {company.demand && (
                    <div style={{ marginTop: 9 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 6px', borderRadius: 999, background: 'linear-gradient(135deg, #fde8d4, #fbd0b0)', color: '#b84a10', letterSpacing: '0.04em', boxShadow: '0 1px 4px rgba(184,74,16,.15)' }}>想链接</span>
                      </div>
                      <p style={{ margin: 0, color: '#536966', fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {highlightText(company.demand, searchQuery)}
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>
      </section>

      <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />

      {lockedBuildingDialog && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(22,59,59,.38)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLockedBuildingDialog(null)}
        >
          <div
            style={{ background: 'white', borderRadius: 28, padding: '44px 40px 36px', maxWidth: 420, width: 'calc(100% - 48px)', textAlign: 'center', boxShadow: '0 32px 80px rgba(22,59,59,.22)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(54,183,173,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <Building2 size={30} color="var(--lake-deep)" strokeWidth={1.6} />
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {lockedBuildingDialog} 号楼暂未开放
            </h3>
            <p style={{ margin: '0 0 28px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
              如您已是入驻企业，可提交最新信息，让更多园区伙伴发现合作机会；如您有入驻意向，也可留下企业信息，运营人员将第一时间与您对接。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
              <a
                href="#/submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'var(--orange)', color: '#342219', border: 'none', borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 800, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease', boxSizing: 'border-box' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                提交企业信息
              </a>
              <a
                href={LEASE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: 'white', color: '#5b8db8', border: '1px solid #c8dff0', borderRadius: 14, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', transition: '0.15s ease', boxSizing: 'border-box' }}
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
