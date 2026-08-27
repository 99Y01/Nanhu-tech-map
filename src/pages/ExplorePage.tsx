import React, { useState } from 'react';
import { companies } from '../data/companyData';
import ResourceMapTab from './explore/ResourceMapTab';
import ParkOverviewTab from './explore/ParkOverviewTab';
import { Search, Building2 } from 'lucide-react';

type ExploreTab = 'find-resource' | 'see-park';

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('find-resource');
  const [resourceInitialBuilding, setResourceInitialBuilding] = useState<string | null>(null);

  const handleSwitchToResources = (buildingNo?: string) => {
    setResourceInitialBuilding(buildingNo ?? null);
    setActiveTab('find-resource');
  };

  const TABS: { key: ExploreTab; label: string; icon: React.ReactNode; hint: string }[] = [
    { key: 'find-resource', label: '找资源', icon: <Search size={14} />, hint: '企业 · 技术 · 对接' },
    { key: 'see-park', label: '看园区', icon: <Building2 size={14} />, hint: '楼栋 · 空间 · 认知' },
  ];

  return (
    <div style={{ padding: '20px 20px 34px' }}>
      <style>{`
        @media (max-width: 700px) {
          .explore-hero-title { font-size: 22px !important; }
        }
        @media (max-width: 480px) {
          .explore-page-wrap { padding: 12px 12px 24px !important; }
        }
      `}</style>

      <section style={{ marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--lake-deep)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--lake)', boxShadow: '0 0 0 5px rgba(54,183,173,.13)', display: 'inline-block' }} />
          南湖未来科学园 · 持续更新中
        </div>
        <h1 className="explore-hero-title" style={{
          fontFamily: '"Arial Black", "PingFang SC", sans-serif',
          margin: '0 0 4px',
          fontSize: 'clamp(22px, 3.5vw, 48px)',
          lineHeight: 1.1,
          letterSpacing: '-0.06em',
        }}>
          探索南湖
        </h1>
        <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
          空间上看南湖，资源上找伙伴
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'baseline', gap: 6,
          padding: '10px 16px',
          borderTop: '2px solid var(--ink)',
          background: 'rgba(255,255,255,.5)',
        }}>
          <b style={{ fontFamily: '"Arial Black", "PingFang SC", sans-serif', fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em' }}>
            {companies.length}
          </b>
          <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 600 }}>家企业正在开放技术、产品与合作资源</span>
          <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 4 }}>企业自主提交 · 持续更新</span>
        </div>
      </section>

      <div style={{
        display: 'flex', gap: 0, marginBottom: 16,
        background: 'rgba(255,255,255,.6)',
        border: '1px solid var(--line)',
        borderRadius: 14,
        width: 'fit-content',
        backdropFilter: 'blur(8px)',
        padding: 4,
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === 'find-resource') setResourceInitialBuilding(null);
              }}
              style={{
                border: 0,
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'white' : 'var(--ink)',
                borderRadius: 10,
                padding: '8px 18px',
                fontSize: 13, fontWeight: isActive ? 700 : 400,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <span style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{tab.hint}</span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'find-resource' && (
        <ResourceMapTab
          key={resourceInitialBuilding ?? 'all'}
          initialBuilding={resourceInitialBuilding}
        />
      )}

      {activeTab === 'see-park' && (
        <ParkOverviewTab onSwitchToResources={handleSwitchToResources} />
      )}
    </div>
  );
}
