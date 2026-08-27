import React, { useState, useRef, useEffect, useCallback } from 'react';
import { companies } from '../../data/companyData';
import { ArrowRight, Building2 } from 'lucide-react';

const MAP_IMAGE_URL = 'https://1d-static.alibaba-inc.com/oneday/source/ab44ae18-0e98-4e82-9a3b-54e4b9007eb4.png';
const MAP_IMAGE_ASPECT_RATIO = 8492 / 5097;

interface BuildingInfo {
  x: number;
  y: number;
  open: boolean;
  label: string;
  zone: 'north' | 'south' | 'east' | 'west' | 'center';
}

const buildingInfoMap: Record<string, BuildingInfo> = {
  "1":  { x: 61.7, y: 59.7, open: false, label: '1号楼', zone: 'east' },
  "2":  { x: 53.8, y: 46.2, open: false, label: '2号楼', zone: 'center' },
  "3":  { x: 38.4, y: 37.8, open: true,  label: '3号楼', zone: 'center' },
  "4":  { x: 46.8, y: 31.1, open: true,  label: '4号楼', zone: 'north' },
  "5":  { x: 54.4, y: 21.8, open: true,  label: '5号楼', zone: 'north' },
  "6":  { x: 61.4, y: 21.4, open: true,  label: '6号楼', zone: 'north' },
  "7":  { x: 76.1, y: 27.2, open: false, label: '7号楼', zone: 'east' },
  "8":  { x: 71.6, y: 40.9, open: true,  label: '8号楼', zone: 'east' },
  "9":  { x: 66.2, y: 50.6, open: true,  label: '9号楼', zone: 'east' },
  "10": { x: 61.6, y: 74.3, open: true,  label: '10号楼', zone: 'south' },
  "11": { x: 47.4, y: 64.9, open: true,  label: '11号楼', zone: 'south' },
  "12": { x: 35.1, y: 54.5, open: false, label: '12号楼', zone: 'west' },
  "13": { x: 25.7, y: 43.6, open: false, label: '13号楼', zone: 'west' },
  "14": { x: 26,   y: 59.1, open: false, label: '14号楼', zone: 'west' },
  "15": { x: 38.7, y: 69.3, open: true,  label: '15号楼', zone: 'south' },
  "16": { x: 29.7, y: 73.3, open: false, label: '16号楼', zone: 'west' },
};

const ZONE_LABELS: Record<string, string> = {
  north: '北区', south: '南区', east: '东区', west: '西区', center: '中区',
};

const ZONE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  north:  { bg: 'rgba(99,102,241,.08)',  border: 'rgba(99,102,241,.25)',  text: '#4338ca' },
  south:  { bg: 'rgba(6,182,212,.08)',   border: 'rgba(6,182,212,.25)',   text: '#0e7490' },
  east:   { bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.25)',  text: '#b45309' },
  west:   { bg: 'rgba(107,114,128,.08)', border: 'rgba(107,114,128,.25)', text: '#374151' },
  center: { bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.25)',  text: '#065f46' },
};

const buildingCompanyCountAll: Record<string, number> = {};
companies.forEach(c => {
  buildingCompanyCountAll[c.building] = (buildingCompanyCountAll[c.building] || 0) + 1;
});

interface ParkOverviewTabProps {
  onSwitchToResources: (buildingNo?: string) => void;
}

export default function ParkOverviewTab({ onSwitchToResources }: ParkOverviewTabProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [imageRect, setImageRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

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

  const selectedInfo = selectedBuilding ? buildingInfoMap[selectedBuilding] : null;
  const selectedCount = selectedBuilding ? (buildingCompanyCountAll[selectedBuilding] || 0) : 0;
  const totalBuildingCount = Object.keys(buildingInfoMap).length;

  return (
    <>
      <style>{`
        @keyframes overviewPinPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.15); }
        }
        @media (max-width: 700px) {
          .overview-section {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .overview-map-area { height: 56vw !important; min-height: 220px !important; }
          .overview-sidebar { max-height: 320px !important; overflow-y: auto !important; }
        }
      `}</style>

      <section className="overview-section" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        height: 600,
        border: '1px solid var(--line)',
        borderRadius: 24,
        background: '#eef1f7',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}>
        <div
          className="overview-map-area"
          ref={mapContainerRef}
          style={{ position: 'relative', overflow: 'hidden', background: '#e4e9f2', cursor: 'default' }}
          onClick={() => setSelectedBuilding(null)}
        >
          <img
            src={MAP_IMAGE_URL}
            alt="南湖未来科学园园区全览"
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
            {Object.entries(buildingInfoMap).map(([buildingNo, info]) => {
              const companyCount = buildingCompanyCountAll[buildingNo] || 0;
              const hasOpenResources = companyCount > 0;
              const isSelected = selectedBuilding === buildingNo;
              const isDimmed = selectedBuilding !== null && !isSelected;

              const centerX = (info.x / 100) * imageRect.width;
              const centerY = (info.y / 100) * imageRect.height;

              const isMobile = imageRect.width > 0 && imageRect.width < 500;
              const dotSize = isSelected ? (isMobile ? 28 : 38) : (isMobile ? 20 : 28);

              const dotColor = isSelected
                ? '#1e2d3d'
                : (hasOpenResources ? '#087d76' : (info.open ? '#5b8db8' : '#b0bec5'));

              return (
                <button
                  key={buildingNo}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedBuilding(prev => prev === buildingNo ? null : buildingNo);
                  }}
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
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        width: dotSize + 16, height: dotSize + 16,
                        borderRadius: '50%',
                        background: 'rgba(30,45,61,.08)',
                        border: '2px solid rgba(30,45,61,.2)',
                        animation: 'overviewPinPulse 2s ease-in-out infinite',
                        zIndex: -1,
                      }} />
                    )}
                    <div style={{
                      width: dotSize, height: dotSize,
                      borderRadius: '50%',
                      background: dotColor,
                      border: `${isSelected ? 3 : 2.5}px solid rgba(255,255,255,${isSelected ? '.95' : '.85'})`,
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(0,0,0,.35)'
                        : (hasOpenResources ? '0 3px 10px rgba(8,125,118,.3)' : '0 2px 8px rgba(0,0,0,.2)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.22s ease',
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: isSelected ? (isMobile ? 11 : 14) : (isMobile ? 8 : 11),
                        fontWeight: 900,
                        fontFamily: '"Nunito","Varela Round","PingFang SC","Arial Rounded MT Bold",sans-serif',
                        userSelect: 'none',
                        lineHeight: 1,
                      }}>
                        {buildingNo}
                      </span>
                    </div>

                    {hasOpenResources && !isSelected && (
                      <span style={{
                        position: 'absolute', right: -3, top: -3,
                        width: isMobile ? 8 : 10, height: isMobile ? 8 : 10,
                        borderRadius: '50%',
                        background: '#f97316',
                        border: '1.5px solid white',
                        boxShadow: '0 1px 4px rgba(249,115,22,.5)',
                      }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            position: 'absolute', bottom: 14, left: 14, zIndex: 10,
          }}>
            <div style={{
              background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(91,141,184,.2)', borderRadius: 10,
              padding: '8px 12px',
              boxShadow: '0 2px 10px rgba(0,0,0,.1)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ink)', marginBottom: 5, letterSpacing: '0.06em' }}>图例</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { color: '#087d76', label: '有开放资源' },
                  { color: '#5b8db8', label: '已开放楼栋' },
                  { color: '#b0bec5', label: '暂未开放' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, border: '1.5px solid white', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="overview-sidebar" style={{
          background: 'var(--cream)', borderLeft: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', minHeight: 0,
        }}>
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--ink)', marginBottom: 3 }}>
              园区楼栋
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              共 {totalBuildingCount} 栋，点击查看详情
            </div>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {Object.entries(buildingInfoMap).map(([buildingNo, info]) => {
              const companyCount = buildingCompanyCountAll[buildingNo] || 0;
              const hasResources = companyCount > 0;
              const isSelected = selectedBuilding === buildingNo;
              const zoneStyle = ZONE_COLORS[info.zone];

              return (
                <div
                  key={buildingNo}
                  onClick={() => setSelectedBuilding(prev => prev === buildingNo ? null : buildingNo)}
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--line)',
                    background: isSelected ? 'rgba(30,45,61,.04)' : 'transparent',
                    cursor: 'pointer',
                    transition: '0.15s ease',
                    borderLeft: isSelected ? '3px solid var(--ink)' : '3px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.02)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontFamily: '"Arial Black", "PingFang SC", sans-serif',
                        fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em',
                        color: isSelected ? 'var(--ink)' : '#2d3748',
                      }}>
                        {buildingNo}号楼
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 999,
                        background: zoneStyle.bg, color: zoneStyle.text,
                        border: `1px solid ${zoneStyle.border}`,
                        letterSpacing: '0.04em',
                      }}>
                        {ZONE_LABELS[info.zone]}
                      </span>
                    </div>
                    <Building2 size={14} color={isSelected ? 'var(--ink)' : 'var(--muted)'} />
                  </div>

                  <div style={{ marginTop: 5 }}>
                    {hasResources ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: '#087d76',
                          background: 'rgba(8,125,118,.08)',
                          padding: '2px 8px', borderRadius: 999,
                          border: '1px solid rgba(8,125,118,.2)',
                        }}>
                          {companyCount} 家企业开放资源
                        </span>
                        {isSelected && (
                          <button
                            onClick={e => { e.stopPropagation(); onSwitchToResources(buildingNo); }}
                            style={{
                              border: 0, background: 'var(--ink)', color: 'white',
                              borderRadius: 8, padding: '4px 10px',
                              fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              transition: '0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                          >
                            查看相关资源 <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {info.open ? '暂无开放资源' : '暂未开放'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedBuilding && selectedCount > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', flexShrink: 0 }}>
              <button
                onClick={() => onSwitchToResources(selectedBuilding)}
                style={{
                  width: '100%', border: 0, background: 'var(--ink)',
                  color: 'white', borderRadius: 10, padding: '11px 0',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: '0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                查看 {selectedBuilding} 号楼开放资源 <ArrowRight size={13} />
              </button>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
