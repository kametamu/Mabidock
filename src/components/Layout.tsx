import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: '育成', path: '/training' },
  { label: '稼ぎ', path: '/money' },
  { label: '日課', path: '/dailies' }
];

function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1 className="brand">マビノギ ポータル</h1>
        <nav>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  to={item.path}
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
