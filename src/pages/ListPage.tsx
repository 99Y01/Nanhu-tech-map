import React, { useState, useMemo } from 'react';
import { companies, buildingList, Company } from '../data/companyData';
import CompanyModal from '../components/CompanyModal';
import ConnectModal from '../components/ConnectModal';
import { Search, Sparkles, Link, Send } from 'lucide-react';

interface ConnectTarget {
  companyName: string;
  kind: 'supply' | 'demand';
  content: string;
}

const keywords = {
  ability: ["无人机","AI","巡检","培训","设计","平台","智能制造","低空","检测","AIGC"],
  need: ["客户资源","应用场景","融资","渠道","政企合作","院校","产业合作","供应链","市场拓展"],
};

function tagsFor(text: string, type: 'ability' | 'need'): string[] {
  return keywords[type].filter(k => text.includes(k)).slice(0, 3);
}

type FilterType = "all" | "supply" | "demand";

/** 开放楼栋列表（排除"全部"占位符，仅保留有企业的楼栋编号） */
const openBuildingNumbers = buildingList.filter(b => b !== '全部');

export default function ListPage() {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("全部");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [connectTarget, setConnectTarget] = useState<ConnectTarget | null>(null);

  const filtered = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = !searchQuery || `${company.name}${company.capability}${company.demand}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBuilding = selectedBuilding === '全部' || company.building === selectedBuilding;
      const matchesType =
        filterType === 'all' ||
        (filterType === 'supply' && company.capability) ||
        (filterType === 'demand' && company.demand);
      return matchesSearch && matchesBuilding && matchesType;
    });
  }, [filterType, searchQuery, selectedBuilding]);

  return (
    <div style={{ padding: '24px 28px 34px' }}>
      {/* Hero */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24, margin: '4px 0 18px' }}>
        <div>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--lake-deep)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lake)', boxShadow: '0 0 0 6px rgba(54,183,173,.13)', display: 'inline-block' }} />
            园区供需撮合 · 2026
          </div>
          <h1 style={{ fontFamily: '"Arial Black", "PingFang SC", sans-serif', margin: '11px 0 7px', fontSize: 'clamp(35px, 4.3vw, 66px)', lineHeight: 1.1, letterSpacing: '-0.07em' }}>
            把能力放上来<br />让<em style={{ color: 'var(--lake-deep)', fontStyle: 'normal' }}>合作发生</em>
          </h1>
          <p style={{ maxWidth: 610, color: 'var(--muted)', lineHeight: 1.9, fontSize: 14, margin: '10px 0 0' }}>
            发布企业可开放的技术、产品或资源需求，快速找到园区里能接得住的合作伙伴。
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 320 }}>
          {[
            { value: companies.length, label: '供应能力' },
            { value: companies.length, label: '链接需求' },
          ].map(({ value, label }) => (
            <div key={label} style={{ padding: 17, borderTop: '1px solid var(--ink)', background: 'rgba(255,255,255,.36)' }}>
              <b style={{ display: 'block', fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 'normal' }}>{value}</b>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 工具栏 */}
      <section style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{
          flex: 1, minWidth: 260, height: 45,
          border: '1px solid var(--line)', borderRadius: 14,
          background: 'rgba(255,255,255,.75)',
          display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
        }}>
          <Search size={15} color="var(--muted)" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索能力、需求或企业名称…"
            style={{ border: 0, outline: 0, background: 'transparent', width: '100%', color: 'var(--ink)', fontSize: 13 }}
          />
        </div>
        <div style={{
          display: 'flex', gap: 7, padding: 5,
          background: 'rgba(255,255,255,.55)',
          border: '1px solid var(--line)', borderRadius: 999,
        }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'supply', label: '可提供', icon: <Sparkles size={14} /> },
            { key: 'demand', label: '想链接', icon: <Link size={14} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilterType(key as FilterType)}
              style={{
                border: 0,
                background: filterType === key ? 'var(--ink)' : 'transparent',
                color: filterType === key ? 'white' : 'var(--ink)',
                padding: '9px 15px', borderRadius: 999,
                cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: '0.15s ease',
              }}
            >
              {icon}{label}
            </button>
          ))}
        </div>
      </section>

      {/* 楼栋筛选条 */}
      <section style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', marginRight: 2 }}>楼栋</span>
        {['全部', ...openBuildingNumbers].map((buildingNo) => {
          const isActive = selectedBuilding === buildingNo;
          return (
            <button
              key={buildingNo}
              onClick={() => setSelectedBuilding(buildingNo)}
              style={{
                border: `1px solid ${isActive ? 'var(--ink)' : 'var(--line)'}`,
                background: isActive ? 'var(--ink)' : 'rgba(255,255,255,.6)',
                color: isActive ? 'white' : 'var(--ink)',
                padding: '6px 13px',
                borderRadius: 999,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isActive ? 800 : 400,
                transition: '0.15s ease',
                lineHeight: 1,
              }}
            >
              {buildingNo === '全部' ? '全部楼栋' : `${buildingNo} 号楼`}
            </button>
          );
        })}
        {selectedBuilding !== '全部' && (
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>
            共 {filtered.length} 条
          </span>
        )}
      </section>

      {/* 卡片网格 */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', minHeight: 220, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--muted)', padding: 35 }}>
            <div>
              <Search size={30} style={{ margin: '0 auto 10px' }} />
              <b style={{ display: 'block', color: 'var(--ink)', fontSize: 16, marginBottom: 5 }}>暂未找到匹配内容</b>
              <span>试试调整筛选条件或搜索关键词</span>
            </div>
          </div>
        ) : (
          filtered.map((company) => (
            <article
              key={company.id}
              style={{
                border: '1px solid var(--line)', borderRadius: 18,
                padding: 18, background: 'white', transition: '0.18s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(8,125,118,.55)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px rgba(22,59,59,.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3
                  style={{ margin: 0, fontSize: 15, cursor: 'pointer' }}
                  onClick={() => setSelectedCompany(company)}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--lake-deep)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                >
                  {company.name}
                </h3>
                {company.building && company.building !== '-' && (
                  <span style={{
                    font: '10px monospace', fontWeight: 700,
                    color: '#fff', background: 'linear-gradient(135deg, #5b8db8, #2d5f8a)',
                    padding: '4px 7px', borderRadius: 6,
                    boxShadow: '0 2px 6px rgba(45,95,138,.3)',
                    flexShrink: 0,
                  }}>
                    {company.building}＃
                  </span>
                )}
              </div>
              {company.capability && (filterType === 'all' || filterType === 'supply') && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 6px', borderRadius: 999, background: 'linear-gradient(135deg, #d4f5e2, #b8ecd0)', color: '#1a7a45', letterSpacing: '0.04em' }}>可提供</span>
                  <p style={{ margin: '6px 0 0', color: '#536966', fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {company.capability}
                  </p>
                </div>
              )}
              {company.demand && (filterType === 'all' || filterType === 'demand') && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 6px', borderRadius: 999, background: 'linear-gradient(135deg, #fde8d4, #fbd0b0)', color: '#b84a10', letterSpacing: '0.04em' }}>想链接</span>
                  <p style={{ margin: '6px 0 0', color: '#536966', fontSize: 12, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {company.demand}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setConnectTarget({ companyName: company.name, kind: 'supply', content: company.capability || company.demand })}
                  style={{
                    border: '1px solid var(--orange)', background: 'var(--orange)',
                    color: '#ffffff', padding: '9px 13px', borderRadius: 11,
                    cursor: 'pointer', fontWeight: 800, fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  发起对接 <Send size={13} />
                </button>
                <button
                  onClick={() => setSelectedCompany(company)}
                  style={{
                    border: '1px solid var(--line)', background: 'white',
                    padding: '9px 13px', borderRadius: 11,
                    cursor: 'pointer', fontWeight: 800, fontSize: 12,
                  }}
                >
                  查看档案
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      <ConnectModal target={connectTarget} onClose={() => setConnectTarget(null)} />
    </div>
  );
}
