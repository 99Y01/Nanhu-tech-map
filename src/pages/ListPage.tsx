import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { companies, Company } from '../data/companyData';
import CompanyModal from '../components/CompanyModal';
import ConnectModal from '../components/ConnectModal';
import {
  Search, X, LayoutGrid, List,
  Sparkles, Link as LinkIcon, ArrowRight, ChevronRight, Filter,
} from 'lucide-react';

// ─── 类型定义 ────────────────────────────────────────────────

interface ConnectTarget {
  companyName: string;
  kind: 'supply' | 'demand';
  content: string;
}

type IndustryTag = 'AI' | '低空经济' | '具身智能' | '未来医疗' | '其他';
type ViewMode = 'card' | 'list';

// ─── 常量 ────────────────────────────────────────────────────

// 快捷场景入口（点击后自动填充搜索词）
const QUICK_SCENES = [
  { label: '全部', keyword: '' },
  { label: '找 AI 技术', keyword: 'AI' },
  { label: '找低空方案', keyword: '低空' },
  { label: '找机器人', keyword: '机器人' },
  { label: '找医疗资源', keyword: '医疗' },
  { label: '找应用场景', keyword: '场景' },
  { label: '找投资合作', keyword: '投资' },
  { label: '找算力', keyword: '算力' },
];

const INDUSTRY_TAGS: IndustryTag[] = ['AI', '低空经济', '具身智能', '未来医疗', '其他'];

// 产业关键词映射
const INDUSTRY_KEYWORDS: Record<IndustryTag, string[]> = {
  'AI': ['AI', 'AIGC', '算法', '大模型', '智能体', '人工智能', '机器学习', '深度学习'],
  '低空经济': ['低空', '无人机', '飞控', '航空', '飞行', '空域', '起降', '巡检'],
  '具身智能': ['具身智能', '机器人', '多智能体', '感知', '运动控制'],
  '未来医疗': ['医疗', '健康', '诊疗', '医院', '医械', '导管', '康养'],
  '其他': [],
};

// ─── 工具函数 ─────────────────────────────────────────────────

function inferIndustryTags(company: Company): IndustryTag[] {
  const text = `${company.name} ${company.capability} ${company.demand}`;
  const matched: IndustryTag[] = [];
  for (const industry of ['AI', '低空经济', '具身智能', '未来医疗'] as IndustryTag[]) {
    if (INDUSTRY_KEYWORDS[industry].some(kw => text.includes(kw))) {
      matched.push(industry);
    }
  }
  if (matched.length === 0) matched.push('其他');
  return matched;
}


function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: 'rgba(255,200,60,.45)', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{part}</mark>
      : part
  );
}

// ─── 主组件 ──────────────────────────────────────────────────

export default function ListPage() {
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  });
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryTag | ''>('');
  const [activeScene, setActiveScene] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [connectTarget, setConnectTarget] = useState<ConnectTarget | null>(null);

  // 从首页带参跳转时同步搜索词
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) setSearchQuery(q);
  }, [location.search]);

  // 点击快捷场景
  const handleSceneClick = useCallback((keyword: string) => {
    setActiveScene(keyword);
    setSearchQuery(keyword);
    setSelectedIndustry('');
  }, []);

  const filtered = useMemo(() => {
    return companies.filter(company => {
      if (searchQuery) {
        const haystack = `${company.name}${company.capability}${company.demand}`.toLowerCase();
        if (!haystack.includes(searchQuery.toLowerCase())) return false;
      }
      if (selectedIndustry) {
        const tags = inferIndustryTags(company);
        if (!tags.includes(selectedIndustry)) return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry]);

  const hasActiveFilters = selectedIndustry !== '' || searchQuery !== '';

  const clearAllFilters = useCallback(() => {
    setSelectedIndustry('');
    setSearchQuery('');
    setActiveScene('');
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .list-page-inner { padding: 32px 40px 56px; }
        .list-toolbar { flex-direction: row; align-items: center; }
        .list-filter-row { display: flex; }
        .list-filter-drawer-trigger { display: none; }
        .list-grid-card { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        .list-scene-row { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        @media (max-width: 900px) {
          .list-grid-card { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .list-page-inner { padding: 20px 16px 80px !important; }
          .list-toolbar { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
          .list-filter-row { display: none !important; }
          .list-filter-drawer-trigger { display: flex !important; }
          .list-grid-card { grid-template-columns: 1fr !important; }
        }

        .filter-drawer-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,.4); backdrop-filter: blur(3px);
        }
        .filter-drawer {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 101;
          background: white; border-radius: 22px 22px 0 0;
          padding: 24px 20px max(24px, env(safe-area-inset-bottom));
          box-shadow: 0 -8px 40px rgba(0,0,0,.18);
          max-height: 80vh; overflow-y: auto;
        }

        .list-scene-row::-webkit-scrollbar { display: none; }
        .list-scene-row { scrollbar-width: none; }
      `}</style>

      <div className="list-page-inner">

        {/* ── 页头 ── */}
        <section style={{ marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', gap: 7, alignItems: 'center',
            color: 'var(--lake-deep)', fontSize: 11, fontWeight: 900,
            letterSpacing: '0.12em', marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lake)', display: 'inline-block' }} />
            RESOURCE PLAZA
          </div>
          <h1 style={{
            fontFamily: '"Arial Black", "PingFang SC", sans-serif',
            fontSize: 'clamp(26px, 4vw, 48px)',
            lineHeight: 1.1, letterSpacing: '-0.06em',
            margin: '0 0 8px',
          }}>
            南湖资源广场
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            找到你需要的技术伙伴，发起合作 · 共 <b style={{ color: 'var(--ink)' }}>{companies.length}</b> 家企业
          </p>
        </section>

        {/* ── 快捷场景入口 ── */}
        <div
          className="list-scene-row"
          style={{
            display: 'flex', gap: 8, marginBottom: 20,
            paddingBottom: 2,
          }}
        >
          {QUICK_SCENES.map(({ label, keyword }) => {
            const isActive = activeScene === keyword && (keyword !== '' || searchQuery === '');
            return (
              <button
                key={label}
                onClick={() => handleSceneClick(keyword)}
                style={{
                  border: `1.5px solid ${isActive ? 'var(--ink)' : 'var(--line)'}`,
                  background: isActive ? 'var(--ink)' : 'rgba(255,255,255,.8)',
                  color: isActive ? 'white' : 'var(--ink)',
                  borderRadius: 999, padding: '7px 15px',
                  fontSize: 13, fontWeight: isActive ? 800 : 500,
                  cursor: 'pointer', transition: 'all .15s',
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── 搜索 + 视图切换 ── */}
        <div className="list-toolbar" style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'white', border: '1.5px solid var(--line)',
            borderRadius: 14, padding: '0 14px', height: 48,
            boxShadow: '0 2px 12px rgba(30,60,100,.06)',
          }}>
            <Search size={16} color="var(--muted)" style={{ flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setActiveScene(''); }}
              placeholder="搜索技术、产品、企业或需求…"
              style={{ border: 0, outline: 0, background: 'transparent', width: '100%', fontSize: 13, color: 'var(--ink)' }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setActiveScene(''); }}
                style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 2, color: 'var(--muted)', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* 移动端筛选按钮 */}
          <button
            className="list-filter-drawer-trigger"
            onClick={() => setShowFilterDrawer(true)}
            style={{
              border: `1.5px solid ${selectedIndustry ? 'var(--ink)' : 'var(--line)'}`,
              background: selectedIndustry ? 'var(--ink)' : 'white',
              color: selectedIndustry ? 'white' : 'var(--ink)',
              borderRadius: 12, padding: '0 14px', height: 48,
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
              alignItems: 'center', gap: 6, flexShrink: 0,
            }}
          >
            <Filter size={15} />
            产业{selectedIndustry ? ' ·' : ''}
          </button>

          {/* 视图切换 */}
          <div style={{
            display: 'flex', border: '1px solid var(--line)',
            borderRadius: 12, overflow: 'hidden', flexShrink: 0,
          }}>
            {([['card', <LayoutGrid size={15} />], ['list', <List size={15} />]] as [ViewMode, React.ReactNode][]).map(([mode, icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  border: 0, padding: '0 13px', height: 48,
                  background: viewMode === mode ? 'var(--ink)' : 'white',
                  color: viewMode === mode ? 'white' : 'var(--muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'all .15s',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── 桌面端产业筛选 ── */}
        <div className="list-filter-row" style={{ gap: 8, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.06em', marginRight: 4, flexShrink: 0 }}>
            产业
          </span>
          <FilterChip active={selectedIndustry === ''} onClick={() => setSelectedIndustry('')} label="全部" />
          {INDUSTRY_TAGS.map(tag => (
            <FilterChip
              key={tag}
              active={selectedIndustry === tag}
              onClick={() => setSelectedIndustry(selectedIndustry === tag ? '' : tag)}
              label={tag}
            />
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                border: '1px solid rgba(209,77,58,.3)',
                background: 'rgba(209,77,58,.06)',
                color: '#d14d3a',
                borderRadius: 999, padding: '6px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                marginLeft: 4,
              }}
            >
              <X size={11} /> 清除筛选
            </button>
          )}
        </div>

        {/* ── 结果统计 ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              找到{' '}
              <b style={{ color: 'var(--ink)', fontWeight: 900, fontSize: 15 }}>{filtered.length}</b>
              {' '}个相关资源
            </span>
            {searchQuery && (
              <span style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 999,
                background: 'rgba(45,95,138,.08)', color: 'var(--lake-deep)',
                fontWeight: 600,
              }}>
                "{searchQuery}"
              </span>
            )}
            {selectedIndustry && (
              <span style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 999,
                background: 'rgba(45,95,138,.08)', color: 'var(--lake-deep)',
                fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {selectedIndustry}
                <button
                  onClick={() => setSelectedIndustry('')}
                  style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* ── 结果区域 ── */}
        {filtered.length === 0 ? (
          <EmptyState onClear={clearAllFilters} searchQuery={searchQuery} />
        ) : viewMode === 'card' ? (
          <div className="list-grid-card" style={{ display: 'grid', gap: 14 }}>
            {filtered.map(company => (
              <ResourceCard
                key={company.id}
                company={company}
                searchQuery={searchQuery}
                onViewDetail={() => setSelectedCompany(company)}
                onConnect={() => setConnectTarget({
                  companyName: company.name,
                  kind: 'supply',
                  content: company.capability || company.demand,
                })}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(company => (
              <ResourceListRow
                key={company.id}
                company={company}
                searchQuery={searchQuery}
                onViewDetail={() => setSelectedCompany(company)}
                onConnect={() => setConnectTarget({
                  companyName: company.name,
                  kind: 'supply',
                  content: company.capability || company.demand,
                })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 移动端筛选抽屉 ── */}
      {showFilterDrawer && (
        <>
          <div className="filter-drawer-overlay" onClick={() => setShowFilterDrawer(false)} />
          <div className="filter-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <b style={{ fontSize: 16 }}>按产业筛选</b>
              <button
                onClick={() => setShowFilterDrawer(false)}
                style={{ border: 0, background: '#f0f0f0', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <FilterChip active={selectedIndustry === ''} onClick={() => setSelectedIndustry('')} label="全部" />
                {INDUSTRY_TAGS.map(tag => (
                  <FilterChip
                    key={tag}
                    active={selectedIndustry === tag}
                    onClick={() => setSelectedIndustry(selectedIndustry === tag ? '' : tag)}
                    label={tag}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearAllFilters(); setShowFilterDrawer(false); }}
                  style={{ flex: 1, border: '1px solid var(--line)', background: 'white', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  清除筛选
                </button>
              )}
              <button
                onClick={() => setShowFilterDrawer(false)}
                style={{ flex: 2, border: 0, background: 'var(--ink)', color: 'white', borderRadius: 12, padding: '12px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                查看 {filtered.length} 个结果
              </button>
            </div>
          </div>
        </>
      )}

      <CompanyModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      <ConnectModal target={connectTarget} onClose={() => setConnectTarget(null)} />
    </div>
  );
}

// ─── 子组件 ──────────────────────────────────────────────────

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        background: active ? 'var(--ink)' : 'rgba(255,255,255,.7)',
        color: active ? 'white' : 'var(--ink)',
        borderRadius: 999, padding: '6px 13px',
        fontSize: 12, fontWeight: active ? 800 : 500,
        cursor: 'pointer', transition: 'all .15s',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

interface CardProps {
  company: Company;
  searchQuery: string;
  onViewDetail: () => void;
  onConnect: () => void;
}

function ResourceCard({ company, searchQuery, onViewDetail, onConnect }: CardProps) {
  const industryTags = inferIndustryTags(company);

  return (
    <article
      style={{
        border: '1px solid var(--line)', borderRadius: 18,
        background: 'white', overflow: 'hidden',
        transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(30,60,100,.1)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,95,138,.3)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
      }}
    >
      {/* 卡片头部：产业标签 + 楼栋 + 企业名，与详情弹窗保持一致 */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
          {industryTags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 800, padding: '3px 8px',
              borderRadius: 999, background: 'rgba(45,95,138,.08)',
              color: 'var(--lake-deep)', letterSpacing: '0.04em',
            }}>
              {tag}
            </span>
          ))}
          {company.building !== '-' && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 7px',
              borderRadius: 5, background: 'linear-gradient(135deg, #5b8db8, #2d5f8a)',
              color: 'white', marginLeft: 'auto', flexShrink: 0,
            }}>
              {company.building}＃
            </span>
          )}
        </div>

        <h3
          style={{ margin: 0, fontSize: 16, fontWeight: 700, lineHeight: 1.35, cursor: 'pointer' }}
          onClick={onViewDetail}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--lake-deep)')}
          onMouseLeave={e => (e.currentTarget.style.color = '')}
        >
          {highlightText(company.name, searchQuery)}
        </h3>
      </div>

      {/* 能提供 */}
      {company.capability && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'rgba(26,122,69,.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Sparkles size={11} color="#1a7a45" />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#1a7a45', letterSpacing: '0.06em' }}>能提供</span>
          </div>
          <p style={{
            margin: 0, fontSize: 12, color: '#536966', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {highlightText(company.capability, searchQuery)}
          </p>
        </div>
      )}

      {/* 正在寻找 */}
      {company.demand && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', background: 'rgba(184,74,16,.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <LinkIcon size={11} color="#b84a10" />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#b84a10', letterSpacing: '0.06em' }}>正在寻找</span>
          </div>
          <p style={{
            margin: 0, fontSize: 12, color: '#7a4020', lineHeight: 1.6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {highlightText(company.demand, searchQuery)}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={onViewDetail}
          style={{
            flex: 1,
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--ink)', padding: '9px 12px', borderRadius: 10,
            cursor: 'pointer', fontWeight: 700, fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all .15s',
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
          查看详情 <ChevronRight size={12} />
        </button>
        <button
          onClick={onConnect}
          style={{
            flex: 1,
            border: 0, background: 'var(--ink)',
            color: '#fff', padding: '9px 12px', borderRadius: 10,
            cursor: 'pointer', fontWeight: 800, fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          发起对接 <ArrowRight size={12} />
        </button>
      </div>
    </article>
  );
}

function ResourceListRow({ company, searchQuery, onViewDetail, onConnect }: CardProps) {
  const industryTags = inferIndustryTags(company);

  return (
    <div
      style={{
        border: '1px solid var(--line)', borderRadius: 14,
        background: 'white', padding: '14px 16px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        transition: 'border-color .15s, box-shadow .15s',
        cursor: 'pointer',
      }}
      onClick={onViewDetail}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,95,138,.3)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(30,60,100,.07)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      {/* 楼栋标识 */}
      {company.building !== '-' && (
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #5b8db8, #2d5f8a)',
          display: 'grid', placeItems: 'center',
          color: 'white', fontSize: 12, fontWeight: 900,
        }}>
          {company.building}
        </div>
      )}

      {/* 主体内容 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
            {highlightText(company.name, searchQuery)}
          </h3>
          {industryTags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px',
              borderRadius: 999, background: 'rgba(45,95,138,.08)',
              color: 'var(--lake-deep)',
            }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {company.capability && (
            <p style={{ margin: 0, fontSize: 12, color: '#536966', lineHeight: 1.5, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#1a7a45', marginRight: 5 }}>能提供</span>
              {highlightText(company.capability.slice(0, 60) + (company.capability.length > 60 ? '…' : ''), searchQuery)}
            </p>
          )}
          {company.demand && (
            <p style={{ margin: 0, fontSize: 12, color: '#7a4020', lineHeight: 1.5, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#b84a10', marginRight: 5 }}>正在找</span>
              {highlightText(company.demand.slice(0, 60) + (company.demand.length > 60 ? '…' : ''), searchQuery)}
            </p>
          )}
        </div>
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        <button
          onClick={onConnect}
          style={{
            border: 0, background: 'var(--ink)',
            color: '#fff', padding: '7px 12px', borderRadius: 9,
            cursor: 'pointer', fontWeight: 800, fontSize: 11,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          对接
        </button>
        <button
          onClick={onViewDetail}
          style={{
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--ink)', padding: '7px 11px', borderRadius: 9,
            cursor: 'pointer', fontWeight: 700, fontSize: 11,
          }}
        >
          详情
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onClear, searchQuery }: { onClear: () => void; searchQuery: string }) {
  const suggestions = ['AI算法', '无人机', '机器人', '医疗', '算力', '低空'];

  return (
    <div style={{
      minHeight: 280, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 20px',
      border: '1px dashed var(--line)', borderRadius: 18,
      background: 'rgba(255,255,255,.5)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(30,45,61,.06)',
        display: 'grid', placeItems: 'center', margin: '0 auto 16px',
      }}>
        <Search size={24} color="var(--muted)" />
      </div>
      <b style={{ display: 'block', fontSize: 16, marginBottom: 8 }}>
        {searchQuery ? `没有找到"${searchQuery}"相关资源` : '暂无匹配资源'}
      </b>
      <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7, margin: '0 0 16px', maxWidth: 320 }}>
        换个关键词试试，或者浏览以下热门方向
      </p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
        {suggestions.map(s => (
          <button
            key={s}
            onClick={onClear}
            style={{
              border: '1px solid var(--line)', background: 'white',
              borderRadius: 999, padding: '5px 12px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: 'var(--ink)',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={onClear}
          style={{
            border: '1px solid var(--ink)', background: 'var(--ink)',
            color: 'white', borderRadius: 10, padding: '9px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          查看全部企业
        </button>
      </div>
    </div>
  );
}
