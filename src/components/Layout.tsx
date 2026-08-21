import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { MapPinned, Map, LayoutGrid, Tag, Plus } from 'lucide-react';

export default function Layout() {
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
        .nav-label-desktop { display: inline; }
        .submit-btn-desktop { display: flex; }
        @media (max-width: 600px) {
          .nav-label-desktop { display: none; }
          .submit-btn-desktop { display: none; }
          .header-inner { padding: 0 16px !important; }
          .brand-subtitle { display: none !important; }
        }
      `}</style>

      {/* 顶部导航栏 */}
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
          {/* 品牌 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
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
              <span className="brand-subtitle" style={{ display: 'block', color: 'var(--muted)', fontSize: 10, letterSpacing: '0.16em', marginTop: 1 }}>
                NANHU TECH ATLAS
              </span>
            </div>
          </div>

          {/* 导航 */}
          <nav style={{
            display: 'flex',
            gap: 4,
            padding: 4,
            background: 'rgba(255,255,255,.55)',
            border: '1px solid var(--line)',
            borderRadius: 999,
          }}>
            {[
              { to: '/', label: '园区全览', icon: <Map size={14} />, end: true },
              { to: '/list', label: '资源广场', icon: <LayoutGrid size={14} />, end: false },
              { to: '/submit', label: '信息更新', icon: <Tag size={14} />, end: false },
            ].map(({ to, label, icon, end }) => (
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
                  padding: '8px 13px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  textDecoration: 'none',
                  transition: 'all .18s ease',
                })}
              >
                {icon}
                <span className="nav-label-desktop">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 提交按钮（桌面端显示） */}
          <NavLink
            to="/submit"
            className="submit-btn-desktop"
            style={({ isActive }) => ({
              alignItems: 'center',
              gap: 8,
              border: '1px solid var(--ink)',
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'white' : 'var(--ink)',
              padding: '9px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              transition: 'all .18s ease',
            })}
          >
            <Plus size={15} />
            提交企业信息
          </NavLink>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
