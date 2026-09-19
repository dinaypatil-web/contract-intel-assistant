import React, { useState, useEffect } from 'react';
import { Project, IncomingLetterReview, ContractClause } from './types/contract';
import { mockProjects } from './data/mockProjects';
import { mockLetters } from './data/mockLetters';
import { mockAlerts, mockClaims } from './data/mockAlertsAndClaims';
import { mockTimeline } from './data/mockTimeline';
import { mockConflicts } from './data/mockConflicts';

import { 
  Building2, 
  Scale, 
  AlertTriangle, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveView } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { LetterReviewStudio } from './components/LetterReviewStudio/LetterReviewStudio';
import { HierarchyExplorer } from './components/HierarchyExplorer/HierarchyExplorer';
import { ContractChat } from './components/ContractChat/ContractChat';
import { EarlyWarningView } from './components/EarlyWarning/EarlyWarningView';
import { ClaimsAndVariationsView } from './components/ClaimsAndVariations/ClaimsAndVariationsView';
import { IssueTimelineView } from './components/IssueTimeline/IssueTimelineView';
import { ConflictDetectorView } from './components/ConflictDetector/ConflictDetectorView';
import { DocumentComparisonView } from './components/DocumentComparison/DocumentComparisonView';
import { ReportsView } from './components/Reports/ReportsView';
import { NewProjectModal } from './components/ProjectWizard/NewProjectModal';
import { IngestCommunicationModal } from './components/LetterReviewStudio/IngestCommunicationModal';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeProject, setActiveProject] = useState<Project | null>(mockProjects[0] || null);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [letters, setLetters] = useState<IncomingLetterReview[]>(mockLetters);

  // Project-isolated data
  const projectLetters = activeProject ? letters.filter(l => l.projectId === activeProject.id) : [];
  const [activeLetter, setActiveLetter] = useState<IncomingLetterReview | null>(projectLetters[0] || null);

  const projectAlerts = activeProject ? mockAlerts.filter(a => a.projectId === activeProject.id) : [];
  const projectClaims = activeProject ? mockClaims.filter(c => c.projectId === activeProject.id) : [];
  const projectTimeline = activeProject ? mockTimeline.filter(t => t.projectId === activeProject.id) : [];
  const projectConflicts = activeProject ? mockConflicts.filter(c => c.projectId === activeProject.id) : [];

  const criticalAlertsCount = projectAlerts.filter(a => a.severity === 'Critical').length;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [isDarkMode]);

  // Handle Project Change
  const handleSelectProject = (proj: Project) => {
    setActiveProject(proj);
    const newLetters = letters.filter(l => l.projectId === proj.id);
    setActiveLetter(newLetters[0] || null);
  };

  const handleUpdateLetter = (newOrUpdated: IncomingLetterReview) => {
    setLetters(prev => {
      const idx = prev.findIndex(l => l.id === newOrUpdated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newOrUpdated;
        return copy;
      }
      return [newOrUpdated, ...prev];
    });
    setActiveLetter(newOrUpdated);
  };

  const handleIngestLetter = (newLetter: IncomingLetterReview) => {
    setLetters(prev => [newLetter, ...prev]);
    setActiveLetter(newLetter);
    setActiveView('letter-review');
    setIsIngestModalOpen(false);
  };

  const handleLaunchChatWithClause = (clause: ContractClause) => {
    setChatPrompt(`Analyze our contractual rights, obligations, and notice requirements under ${clause.clauseNumber} (${clause.title}) in ${clause.volumeNumber}.`);
    setActiveView('chat');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        activeProject={activeProject}
        pendingReviewsCount={projectLetters.length}
        criticalNoticeCount={criticalAlertsCount}
      />

      {/* Main Layout Area */}
      <div className="main-layout">
        <Navbar
          projects={projects}
          activeProject={activeProject}
          onSelectProject={handleSelectProject}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          criticalNoticeCount={criticalAlertsCount}
          onNavigateToNotices={() => setActiveView('early-warning')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          onOpenIngestModal={() => setIsIngestModalOpen(true)}
        />

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={(newProj) => {
            setProjects(prev => [newProj, ...prev]);
            setActiveProject(newProj);
          }}
        />

        {activeProject && (
          <IngestCommunicationModal
            isOpen={isIngestModalOpen}
            onClose={() => setIsIngestModalOpen(false)}
            project={activeProject}
            onIngestLetter={handleIngestLetter}
          />
        )}

        <main className="content-viewport">
          <div className="content-container">
            {!activeProject ? (
              <div style={{ maxWidth: '880px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '54px 36px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 24px rgba(56, 189, 248, 0.2)'
                  }}>
                    <Building2 size={34} color="var(--accent-blue)" />
                  </div>

                  <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '14px' }}>
                    <span className="badge badge-notice">Clean State Initialized</span>
                    <span className="badge badge-success">Local-First Storage</span>
                  </div>

                  <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    Welcome to ContractMind AI Enterprise
                  </h1>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                    AI-powered Construction Contract Intelligence & Correspondence Assistant. Ingest multi-volume contract PDFs (Particular Conditions, General Conditions, Employer Requirements, Specs, BOQ, Drawings) directly from local storage with zero cloud data leakage.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn-primary" 
                      style={{ fontSize: '1rem', padding: '12px 28px' }}
                      onClick={() => setIsNewProjectModalOpen(true)}
                    >
                      <span>+ Onboard New Contract Project</span>
                    </button>
                  </div>
                </div>

                {/* 4 Feature Pillars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--accent-blue)', marginBottom: '8px' }}>
                      <Scale size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>5-Tier Priority Hierarchy</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Strict Sub-Clause 1.5 order of precedence prevents contract ambiguities and groundless claims.
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--status-critical)', marginBottom: '8px' }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>28-Day Notice Watchdog</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Sub-Clause 20.2 time-bar monitoring protects contractor payment and EOT rights from being barred.
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--status-warning)', marginBottom: '8px' }}>
                      <FileText size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>7-Step Letter Review</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Clause extraction, matrix rebuttal, and real-time DO NOT SAY safe phrase scanner.
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px' }}>
                    <div style={{ color: 'var(--status-success)', marginBottom: '8px' }}>
                      <ShieldCheck size={24} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>100% On-Device Privacy</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Contract documents are accessed and indexed directly from your local disk with zero cloud telemetry.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeView === 'dashboard' && (
                  <DashboardView
                    project={activeProject}
                    alerts={projectAlerts}
                    letters={projectLetters}
                    claims={projectClaims}
                    onNavigate={setActiveView}
                    onSelectLetter={(letItem) => {
                      setActiveLetter(letItem);
                      setActiveView('letter-review');
                    }}
                    onSetChatPrompt={(prompt) => {
                      setChatPrompt(prompt);
                      setActiveView('chat');
                    }}
                    onOpenIngestModal={() => setIsIngestModalOpen(true)}
                  />
                )}

                {activeView === 'letter-review' && (
                  <LetterReviewStudio
                    project={activeProject}
                    letter={activeLetter}
                    letters={projectLetters}
                    onSelectLetter={setActiveLetter}
                    onUpdateLetter={handleUpdateLetter}
                    onOpenIngestModal={() => setIsIngestModalOpen(true)}
                  />
                )}

                {activeView === 'hierarchy' && (
                  <HierarchyExplorer
                    project={activeProject}
                    onSelectClauseForChat={handleLaunchChatWithClause}
                  />
                )}

                {activeView === 'chat' && (
                  <ContractChat
                    project={activeProject}
                    initialPrompt={chatPrompt}
                  />
                )}

                {activeView === 'early-warning' && (
                  <EarlyWarningView
                    project={activeProject}
                    alerts={projectAlerts}
                  />
                )}

                {activeView === 'claims' && (
                  <ClaimsAndVariationsView
                    project={activeProject}
                    claims={projectClaims}
                  />
                )}

                {activeView === 'timeline' && (
                  <IssueTimelineView
                    project={activeProject}
                    timeline={projectTimeline}
                  />
                )}

                {activeView === 'conflicts' && (
                  <ConflictDetectorView
                    project={activeProject}
                    conflicts={projectConflicts}
                  />
                )}

                {activeView === 'diff' && (
                  <DocumentComparisonView
                    project={activeProject}
                  />
                )}

                {activeView === 'reports' && (
                  <ReportsView
                    project={activeProject}
                    letters={projectLetters}
                    alerts={projectAlerts}
                    claims={projectClaims}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
