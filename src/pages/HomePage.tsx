import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Building2, Zap, Link as LinkIcon,
  ChevronRight, Plus, Cpu, Wind, Bot, HeartPulse,
} from 'lucide-react';
import { companies } from '../data/companyData';
import CompanyModal from '../components/CompanyModal';
import type { Company } from '../data/companyData';

// ─── 常量 ─────────────────────────────────────────────────────

const HOT_DIRECTIONS = [
  { label: 'AI 算法', keyword: 'AI算法' },
  { label: '低空经济', keyword: '低空' },
  { label: '具身智能', keyword: '具身智能' },
  { label: '无人机', keyword: '无人机' },
  { label: '大模型', keyword: '大模型' },
  { label: '机器人', keyword: '机器人' },
  { label: '找应用场景', keyword: '场景' },
  { label: '找投资合作', keyword: '投资' },
];

// 四大快捷入口
const QUICK_ENTRIES = [
  {
    icon: <Building2 size={24} />,
    title: '找企业',
    desc: '发现园区内的企业',
    examples: ['AI公司', '无人机厂商', '机器人企业'],
    color: '#2d5f8a',
    bg: 'linear-gradient(135deg, #e8f2fb 0%, #d4e8f7 100%)',
    to: '/list',
  },
  {
    icon: <Zap size={24} />,
    title: '找技术',
    desc: '搜索技术能力与产品',
    examples: ['飞控系统', 'AI视觉', '液冷方案'],
    color: '#1a7a45',
    bg: 'linear-gradient(135deg, #e4f7ed 0%, #cff0de 100%)',
    to: '/list?q=技术',
  },
  {
    icon: <LinkIcon size={24} />,
    title: '找合作',
    desc: '寻找产业合作伙伴',
    examples: ['技术合作', '场景对接', '供应链'],
    color: '#b84a10',
    bg: 'linear-gradient(135deg, #fef0e6 0%, #fde0c8 100%)',
    to: '/list?q=合作',
  },
  {
    icon: <Plus size={24} />,
    title: '发布需求',
    desc: '让更多伙伴找到你',
    examples: ['更新企业信息', '发布合作需求', '加入地图'],
    color: '#6b3fa0',
    bg: 'linear-gradient(135deg, #f0eaf8 0%, #e2d5f5 100%)',
    to: '/submit',
  },
];

// 产业方向
const INDUSTRY_DIRECTIONS = [
  { icon: <Cpu size={16} />, label: 'AI & 大模型', color: '#2d5f8a', keyword: 'AI' },
  { icon: <Wind size={16} />, label: '低空经济', color: '#087d76', keyword: '低空' },
  { icon: <Bot size={16} />, label: '具身智能', color: '#6b3fa0', keyword: '具身智能' },
  { icon: <HeartPulse size={16} />, label: '未来医疗', color: '#b84a10', keyword: '医疗' },
];

// 精选企业 ID
const FEATURED_IDS = [7, 10, 13, 29, 32, 48];

// ─── 工具函数 ─────────────────────────────────────────────────

function inferIndustryTags(company: Company): string[] {
  const text = `${company.capability} ${company.demand}`;
  const tagMap: [string, string][] = [
    ['AI', 'AI'],
    ['无人机', '低空经济'],
    ['低空', '低空经济'],
    ['机器人', '机器人'],
    ['具身智能', '具身智能'],
    ['医疗', '医疗健康'],
    ['算力', '算力'],
    ['大模型', '大模型'],
    ['AIGC', 'AIGC'],
    ['巡检', '智慧巡检'],
    ['飞控', '飞控系统'],
    ['培训', '教育培训'],
    ['检测', '检测认证'],
    ['储能', '储能'],
    ['液冷', '液冷'],
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

// 从 capability 提取一句话介绍（取第一个句子或前 40 字）
function extractOneLiner(capability: string): string {
  if (!capability) return '';
  const firstSentence = capability.split(/[。！？\n]/)[0];
  return firstSentence.length > 44 ? firstSentence.slice(0, 44) + '…' : firstSentence;
}

function computeStats(allCompanies: Company[]) {
  const totalCompanies = allCompanies.length;
  const totalCapabilities = allCompanies.filter(c => c.capability).length;
  const totalDemands = allCompanies.filter(c => c.demand).length;
  return { totalCompanies, totalCapabilities, totalDemands };
}

// ─── 主组件 ──────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { totalCompanies, totalCapabilities, totalDemands } = useMemo(
    () => computeStats(companies),
    []
  );

  const featuredCompanies = useMemo(
    () => companies.filter(c => FEATURED_IDS.includes(c.id)),
    []
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
        .home-hero { padding: 72px 40px 52px; }
        .home-hero-title { font-size: clamp(36px, 5.5vw, 68px); }
        .home-search-box { height: 60px; }
        .home-search-btn { height: 60px; padding: 0 28px; }
        .home-quick-grid { grid-template-columns: repeat(4, 1fr); }
        .home-stats-grid { grid-template-columns: repeat(4, 1fr); }
        .home-company-grid { grid-template-columns: repeat(3, 1fr); }
        .home-section { padding: 56px 40px; }
        .home-industry-row { flex-wrap: nowrap; }

        @media (max-width: 1100px) {
          .home-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          .home-company-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .home-hero { padding: 44px 20px 36px !important; }
          .home-hero-title { font-size: 30px !important; }
          .home-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-company-grid { grid-template-columns: 1fr !important; }
          .home-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .home-section { padding: 36px 20px !important; }
          .home-search-row { flex-direction: column !important; gap: 10px !important; }
          .home-search-btn { width: 100% !important; justify-content: center !important; height: 52px !important; }
          .home-search-box { height: 52px !important; }
          .home-industry-row { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* ── 首屏 Hero ── */}
      <section className="home-hero" style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

        {/* 标签 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(45,95,138,.08)', border: '1px solid rgba(45,95,138,.18)',
          borderRadius: 999, padding: '5px 14px', marginBottom: 26,
          fontSize: 12, fontWeight: 700, color: 'var(--lake-deep)', letterSpacing: '0.06em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--lake)', display: 'inline-block' }} />
          南湖未来科学园 · 产业技术资源图谱
        </div>

        {/* 主标题 */}
        <h1 className="home-hero-title" style={{
          fontFamily: '"Arial Black", "PingFang SC", sans-serif',
          lineHeight: 1.1,
          letterSpacing: '-0.05em',
          margin: '0 0 16px',
          fontWeight: 900,
        }}>
          看见技术 · 找到伙伴<br />
          <em style={{ color: 'var(--lake-deep)', fontStyle: 'normal' }}>连接产业</em>
        </h1>

        {/* 副标题 */}
        <p style={{
          color: 'var(--muted)', fontSize: 15, lineHeight: 1.8,
          maxWidth: 520, margin: '0 auto 32px',
        }}>
          探索南湖未来科学园的企业技术、产品与产业合作资源
        </p>

        {/* 搜索框 */}
        <div className="home-search-row" style={{
          display: 'flex', gap: 10, maxWidth: 660, margin: '0 auto 18px',
        }}>
          <div
            className="home-search-box"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'white',
              border: '1.5px solid var(--line)',
              borderRadius: 18,
              padding: '0 18px',
              boxShadow: '0 6px 28px rgba(30,60,100,.1)',
              transition: 'border-color .15s, box-shadow .15s',
            }}
          >
            <Search size={20} color="var(--muted)" style={{ flexShrink: 0 }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索技术、产品、企业或合作需求…"
              style={{
                border: 0, outline: 0, background: 'transparent',
                width: '100%', fontSize: 15, color: 'var(--ink)',
              }}
            />
          </div>
          <button
            className="home-search-btn"
            onClick={() => handleSearch()}
            style={{
              background: 'var(--ink)', color: 'white',
              border: 0, borderRadius: 16, fontWeight: 800, fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              flexShrink: 0, transition: 'opacity .15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            搜索 <ArrowRight size={17} />
          </button>
        </div>

        {/* 热门方向 */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 7,
          justifyContent: 'center', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>热门：</span>
          {HOT_DIRECTIONS.map(({ label, keyword }) => (
            <button
              key={label}
              onClick={() => handleSearch(keyword)}
              style={{
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,.7)',
                color: 'var(--ink)',
                borderRadius: 999, padding: '5px 12px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ink)';
                (e.currentTarget as HTMLElement).style.color = 'white';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.7)';
                (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 四大快捷入口 ── */}
      <section className="home-section" style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 0 }}>
        <div className="home-quick-grid" style={{ display: 'grid', gap: 14 }}>
          {QUICK_ENTRIES.map(({ icon, title, desc, examples, color, bg, to }) => (
            <button
              key={title}
              onClick={() => navigate(to)}
              style={{
                background: bg,
                border: `1px solid ${color}20`,
                borderRadius: 20,
                padding: '22px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform .18s ease, box-shadow .18s ease',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${color}22`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = '';
                (e.currentTarget as HTMLElement).style.boxShadow = '';
              }}
            >
              <div style={{
                color, width: 46, height: 46, borderRadius: 13,
                background: `${color}14`, display: 'grid', placeItems: 'center',
              }}>
                {icon}
              </div>
              <div>
                <div style={{
                  fontSize: 18, fontWeight: 900, color: 'var(--ink)', marginBottom: 3,
                  fontFamily: '"Arial Black", "PingFang SC", sans-serif',
                }}>
                  {title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
              </div>
              {/* 示例标签 */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {examples.map(ex => (
                  <span key={ex} style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 6,
                    background: `${color}10`, color,
                    fontWeight: 600, border: `1px solid ${color}18`,
                  }}>
                    {ex}
                  </span>
                ))}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                color, fontSize: 12, fontWeight: 700, marginTop: 2,
              }}>
                立即探索 <ChevronRight size={13} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── 数据统计 + 产业方向 ── */}
      <section style={{
        background: 'rgba(255,255,255,.6)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '32px 40px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* 数字统计 */}
          <div className="home-stats-grid" style={{ display: 'grid', gap: 0, marginBottom: 28 }}>
            {[
              { value: `${totalCompanies}+`, label: '入驻企业', sub: '覆盖多个产业方向' },
              { value: `${totalCapabilities}`, label: '项技术能力', sub: '可供探索与对接' },
              { value: `${totalDemands}`, label: '项合作需求', sub: '等待你来响应' },
              { value: '4', label: '核心产业方向', sub: 'AI · 低空 · 具身 · 医疗' },
            ].map(({ value, label, sub }, index) => (
              <div key={label} style={{
                textAlign: 'center',
                padding: '12px 0',
                borderRight: index < 3 ? '1px solid var(--line)' : 'none',
              }}>
                <b style={{
                  display: 'block',
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 'normal',
                  color: 'var(--ink)',
                  lineHeight: 1.1,
                }}>
                  {value}
                </b>
                <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700, display: 'block', marginTop: 4 }}>
                  {label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 2 }}>
                  {sub}
                </span>
              </div>
            ))}
          </div>

          {/* 产业方向快捷筛选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, flexShrink: 0 }}>产业方向：</span>
            <div className="home-industry-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {INDUSTRY_DIRECTIONS.map(({ icon, label, color, keyword }) => (
                <button
                  key={label}
                  onClick={() => navigate(`/list?q=${encodeURIComponent(keyword)}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: `1px solid ${color}25`,
                    background: `${color}08`,
                    color,
                    borderRadius: 999, padding: '7px 14px',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    transition: 'all .15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = color;
                    (e.currentTarget as HTMLElement).style.color = 'white';
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = `${color}08`;
                    (e.currentTarget as HTMLElement).style.color = color;
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}25`;
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 代表企业 ── */}
      <section className="home-section" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 900, color: 'var(--lake-deep)',
              letterSpacing: '0.12em', marginBottom: 8,
            }}>
              FEATURED COMPANIES
            </div>
            <h2 style={{
              fontFamily: '"Arial Black", "PingFang SC", sans-serif',
              fontSize: 'clamp(22px, 3vw, 34px)',
              letterSpacing: '-0.04em', margin: 0,
            }}>
              代表企业
            </h2>
          </div>
          <button
            onClick={() => navigate('/list')}
            style={{
              border: '1px solid var(--line)', background: 'transparent',
              color: 'var(--ink)', borderRadius: 10, padding: '8px 14px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
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
            查看全部 {totalCompanies}+ 家企业 <ArrowRight size={14} />
          </button>
        </div>

        <div className="home-company-grid" style={{ display: 'grid', gap: 14 }}>
          {featuredCompanies.map(company => {
            const tags = inferIndustryTags(company);
            const oneLiner = extractOneLiner(company.capability);
            return (
              <article
                key={company.id}
                style={{
                  border: '1px solid var(--line)',
                  borderRadius: 18,
                  padding: '20px 18px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
                onClick={() => setSelectedCompany(company)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(30,60,100,.1)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,95,138,.35)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = '';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                }}
              >
                {/* 标签行 */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {tags.map(tag => (
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
                      borderRadius: 5,
                      background: 'linear-gradient(135deg, #5b8db8, #2d5f8a)',
                      color: 'white', marginLeft: 'auto',
                    }}>
                      {company.building}＃
                    </span>
                  )}
                </div>

                {/* 企业名 */}
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>
                  {company.name}
                </h3>

                {/* 一句话介绍 */}
                {oneLiner && (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
                    {oneLiner}
                  </p>
                )}

                {/* 正在寻找 */}
                {company.demand && (
                  <div style={{
                    padding: '8px 10px', borderRadius: 9,
                    background: 'rgba(184,74,16,.05)',
                    border: '1px solid rgba(184,74,16,.1)',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#b84a10', letterSpacing: '0.06em', marginBottom: 3 }}>
                      正在寻找
                    </div>
                    <p style={{
                      margin: 0, fontSize: 11, color: '#7a4020', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {company.demand}
                    </p>
                  </div>
                )}

                {/* 查看按钮 */}
                <button
                  onClick={e => { e.stopPropagation(); setSelectedCompany(company); }}
                  style={{
                    border: '1px solid var(--line)', background: 'transparent',
                    borderRadius: 9, padding: '8px 12px',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    color: 'var(--ink)', marginTop: 'auto',
                    transition: 'all .15s',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--ink)';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                  }}
                >
                  查看企业 <ChevronRight size={13} />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 底部 CTA ── */}
      <section style={{
        background: 'var(--ink)',
        color: 'white',
        padding: '56px 40px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', opacity: 0.45, marginBottom: 14 }}>
            JOIN THE ATLAS
          </div>
          <h2 style={{
            fontFamily: '"Arial Black", "PingFang SC", sans-serif',
            fontSize: 'clamp(22px, 3.5vw, 38px)',
            letterSpacing: '-0.04em',
            margin: '0 0 12px',
          }}>
            让更多人找到你
          </h2>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.8, margin: '0 0 28px' }}>
            完善企业信息，发布技术能力与合作需求，<br />
            让园区内外的产业伙伴主动找上门。
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
                background: 'transparent', color: 'rgba(255,255,255,.75)',
                border: '1px solid rgba(255,255,255,.25)', borderRadius: 14, padding: '14px 24px',
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
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.75)';
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
