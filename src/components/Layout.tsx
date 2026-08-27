import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { MapPinned, Home, LayoutGrid, HeartHandshake, ChevronDown, UserCircle, FilePlus, RefreshCw } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',        label: '首页',   icon: <Home size={16} />,        end: true  },
  { to: '/list',    label: '资源广场', icon: <LayoutGrid size={16} />, end: false },
  { to: '/explore', label: '探索南湖', icon: <MapPinned size={16} />, end: false },
];

export default function Layout() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 13% 12%, rgba(255,255,255,.85) 0 5%, transparent 22%),
        linear-gradient(rgba(30,45,61,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30,45,61,.025) 1px, transparent 1px),
        var(--paper)
      `,
      backgroundSize: 'auto, 26px 26px, 26px 26px, auto',
    }}>
      <style>{`
        .desktop-nav { display: flex; }
        .desktop-right { display: flex; }
        .mobile-bottom-nav { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none; }
          .desktop-right { display: none; }
          .mobile-bottom-nav { display: flex; }
          .header-inner { padding: 0 16px !important; }
          .brand-subtitle { font-size: 9px !important; }
          main { padding-bottom: 68px; }
        }
      `}</style>

      <header style={{
        height: 64,
        borderBottom: '1px solid var(--line)',
        background: 'rgba(240,243,247,.88)',
        backdropFilter: 'blur(15px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div className="header-inner" style={{
          height: '100%',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* 品牌 Logo */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: '12px 12px 12px 4px',
              background: 'var(--ink)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              transform: 'rotate(-3deg)',
              boxShadow: '5px 5px 0 #b0c8e0',
              flexShrink: 0,
            }}>
              <MapPinned size={19} />
            </div>
            <div>
              <strong style={{
                display: 'block',
                fontFamily: '"Arial Black", "PingFang SC", sans-serif',
                letterSpacing: '-0.04em',
                fontSize: 17,
              }}>南湖技术地图</strong>
              <span className="brand-subtitle" style={{
                display: 'block', color: 'var(--muted)', fontSize: 10,
                letterSpacing: '0.16em', marginTop: 1,
              }}>
                NANHU TECH MAP
              </span>
            </div>
          </NavLink>

          {/* 桌面导航 */}
          <nav className="desktop-nav" style={{
            gap: 4,
            padding: 4,
            background: 'rgba(255,255,255,.55)',
            border: '1px solid var(--line)',
            borderRadius: 999,
          }}>
            {NAV_ITEMS.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  border: 0,
                  background: isActive ? 'var(--ink)' : 'transparent',
                  color: isActive ? 'white' : 'var(--ink)',
                  padding: '8px 14px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  textDecoration: 'none',
                  transition: 'all .18s ease',
                })}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </nav>

          {/* 右上角：企业入驻/管理 下拉 */}
          <div className="desktop-right" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                border: '1px solid var(--ink)',
                background: dropdownOpen ? 'var(--ink)' : 'transparent',
                color: dropdownOpen ? 'white' : 'var(--ink)',
                padding: '9px 14px',
                borderRadius: 12,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                transition: 'all .18s ease',
              }}
            >
              <UserCircle size={15} />
              企业入驻 / 管理
              <ChevronDown
                size={13}
                style={{
                  transition: 'transform .18s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white',
                border: '1px solid var(--line)',
                borderRadius: 14,
                boxShadow: '0 12px 40px rgba(30,60,100,.14)',
                minWidth: 180,
                overflow: 'hidden',
                zIndex: 100,
              }}>
                <button
                  onClick={() => { navigate('/submit'); setDropdownOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', border: 0, background: 'transparent',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: 'var(--ink)', textAlign: 'left',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f3f7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <FilePlus size={15} color="var(--lake-deep)" />
                  提交企业信息
                </button>
                <div style={{ height: 1, background: 'var(--line)', margin: '0 12px' }} />
                <button
                  onClick={() => { navigate('/submit'); setDropdownOpen(false); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 16px', border: 0, background: 'transparent',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: 'var(--ink)', textAlign: 'left',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f0f3f7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <RefreshCw size={15} color="var(--lake-deep)" />
                  更新企业资料
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* 移动端底部导航 */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: 'rgba(240,243,247,.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--line)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {[
          ...NAV_ITEMS,
          { to: '/submit', label: '入驻', icon: <UserCircle size={20} />, end: false },
        ].map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              flex: 1,
              padding: '4px 0',
              textDecoration: 'none',
              color: isActive ? 'var(--ink)' : 'var(--muted)',
              fontWeight: isActive ? 700 : 400,
              fontSize: 10,
              transition: 'color .15s ease',
            })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
