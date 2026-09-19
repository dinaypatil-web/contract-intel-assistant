import React from 'react';
import { 
  LayoutDashboard, 
  MailCheck, 
  Layers, 
  MessageSquareCode, 
  AlertTriangle, 
  Briefcase, 
  GitCommit, 
  Scale, 
  GitCompare, 
  FileText 
} from 'lucide-react';
import { Project } from '../types/contract';

export type ActiveView = 
  | 'dashboard'
  | 'letter-review'
  | 'hierarchy'
  | 'chat'
  | 'early-warning'
  | 'claims'
  | 'timeline'
  | 'conflicts'
  | 'diff'
  | 'reports';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  activeProject?: Project | null;
  pendingReviewsCount: number;
  criticalNoticeCount: number;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: any;
  badge: string | null;
  badgeCritical?: boolean;
  isHighlight?: boolean;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  activeProject,
  pendingReviewsCount,
  criticalNoticeCount
}) => {
  const navItems: NavSection[] = [
    {
      category: 'Command & Review',
      items: [
        {
          id: 'dashboard' as ActiveView,
          label: 'Dashboard & Radar',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'letter-review' as ActiveView,
          label: 'Letter Review Studio',
          icon: MailCheck,
          badge: pendingReviewsCount > 0 ? `${pendingReviewsCount} LTR` : null,
          isHighlight: true
        }
      ]
    },
    {
      category: 'Contract Knowledge',
      items: [
        {
          id: 'hierarchy' as ActiveView,
          label: 'Contract Hierarchy & Graph',
          icon: Layers,
          badge: activeProject ? `${activeProject.documents.length} Vols` : null
        },
        {
          id: 'chat' as ActiveView,
          label: 'AI Contract Chat',
          icon: MessageSquareCode,
          badge: '6 Modes'
        },
        {
          id: 'conflicts' as ActiveView,
          label: 'Precedence Conflicts',
          icon: Scale,
          badge: null
        },
        {
          id: 'diff' as ActiveView,
          label: 'Document Comparison',
          icon: GitCompare,
          badge: null
        }
      ]
    },
    {
      category: 'Claims & Time Protection',
      items: [
        {
          id: 'early-warning' as ActiveView,
          label: 'Notices & Early Warning',
          icon: AlertTriangle,
          badge: criticalNoticeCount > 0 ? `${criticalNoticeCount} Urg` : null,
          badgeCritical: criticalNoticeCount > 0
        },
        {
          id: 'claims' as ActiveView,
          label: 'Claims & Variations',
          icon: Briefcase,
          badge: activeProject ? `${activeProject.stats.eotClaimedDays}d EOT` : null
        },
        {
          id: 'timeline' as ActiveView,
          label: 'Issue Event Timeline',
          icon: GitCommit,
          badge: null
        },
        {
          id: 'reports' as ActiveView,
          label: 'Executive Reports',
          icon: FileText,
          badge: null
        }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {navItems.map((section, idx) => (
          <div key={idx}>
            <div className="sidebar-category-header">{section.category}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <div
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectView(item.id)}
                >
                  <div className="nav-item-left">
                    <Icon size={18} color={isActive ? 'var(--accent-blue)' : 'inherit'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      className={`badge ${item.badgeCritical ? 'badge-critical' : 'badge-neutral'}`}
                      style={{ fontSize: '0.7rem', padding: '2px 7px' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="project-summary-box">
          <div className="project-summary-title">Active Contract</div>
          <div className="project-summary-val" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeProject ? activeProject.name : 'No Project Selected'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Value: <strong style={{ color: 'var(--text-primary)' }}>{activeProject ? activeProject.value : '$0'}</strong></span>
            <span>EOT: <strong style={{ color: 'var(--accent-blue)' }}>+{activeProject ? activeProject.currentEOTDays : 0}d</strong></span>
          </div>
        </div>
      </div>
    </aside>
  );
};
