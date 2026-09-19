import React from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import { Project } from '../types/contract';

interface NavbarProps {
  projects: Project[];
  activeProject: Project;
  onSelectProject: (proj: Project) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  criticalNoticeCount: number;
  onNavigateToNotices: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewProjectModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  isDarkMode,
  onToggleTheme,
  criticalNoticeCount,
  onNavigateToNotices,
  searchQuery,
  onSearchChange,
  onOpenNewProjectModal
}) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="brand-badge">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div>
            <div className="brand-title">
              ContractMind <span className="brand-tag">AI Enterprise</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Construction Contract Intelligence & Correspondence
            </div>
          </div>
        </div>

        <div className="project-select-wrapper">
          <ShieldCheck size={16} color="var(--accent-blue)" />
          <select 
            className="project-select"
            value={activeProject.id}
            onChange={(e) => {
              const selected = projects.find(p => p.id === e.target.value);
              if (selected) onSelectProject(selected);
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        <button 
          className="btn-primary" 
          style={{ fontSize: '0.78rem', padding: '6px 12px', height: '34px' }}
          onClick={onOpenNewProjectModal}
          title="Onboard new project from local contract folder"
        >
          + New Project
        </button>
      </div>

      <div className="navbar-right">
        <div style={{ position: 'relative', width: '280px' }}>
          <Search 
            size={16} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input 
            type="text"
            className="form-input"
            placeholder="Search clauses, volumes, notices..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '36px', height: '38px', width: '100%' }}
          />
        </div>

        <button 
          className="nav-action-btn"
          onClick={onNavigateToNotices}
          title="Contract Early Warnings & Critical Time-Bars"
        >
          <Bell size={17} color={criticalNoticeCount > 0 ? 'var(--status-critical)' : 'inherit'} />
          <span>Early Warnings</span>
          {criticalNoticeCount > 0 && (
            <span className="badge-counter">{criticalNoticeCount}</span>
          )}
        </button>

        <button 
          className="nav-action-btn"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            CM
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Lead Contracts Eng.</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Commercial & Claims</div>
          </div>
        </div>
      </div>
    </header>
  );
};
