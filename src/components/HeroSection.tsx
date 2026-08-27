import React, { useState } from 'react';
import { HOT_DIRECTIONS } from '../data/mockData';

interface HeroSectionProps {
  onSearch: (keyword: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #0d1b3e 100%)',
        backgroundImage: `
          linear-gradient(135deg, #0f0c29 0%, #1a1a4e 40%, #0d1b3e 100%),
          radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: 'cover, 32px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="py-24 md:py-32 px-4"
    >
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-blue-300 border border-blue-500/30 bg-blue-500/10 mb-6">
            南湖未来科学园 · 技术地图
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
          看见技术 · 找到伙伴 · 连接产业
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10">
          探索南湖未来科学园企业技术、产品与产业资源
        </p>

        <div className="bg-white rounded-2xl shadow-2xl flex items-center p-2 mb-4 max-w-2xl mx-auto">
          <i className="fa-solid fa-magnifying-glass text-gray-400 ml-3 mr-2 text-lg" />
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：机器人视觉 / 无人机 / AI算法 / 找应用场景"
            className="flex-1 border-none outline-none text-gray-800 text-base bg-transparent py-2"
            style={{ minWidth: 0 }}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 rounded-xl text-white font-semibold text-base whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
          >
            搜索
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-10">
          支持搜索：企业名称 · 技术关键词 · 产品 · 行业 · 资源 · 需求
        </p>

        <div>
          <p className="text-gray-400 text-sm mb-4 font-medium">热门方向</p>
          <div className="flex flex-wrap justify-center gap-3">
            {HOT_DIRECTIONS.map(dir => (
              <button
                key={dir.label}
                onClick={() => onSearch(dir.label)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: `${dir.color}22`,
                  border: `1px solid ${dir.color}55`,
                  color: '#e2e8f0',
                }}
              >
                <i className={`fa-solid ${dir.icon}`} style={{ color: dir.color }} />
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
