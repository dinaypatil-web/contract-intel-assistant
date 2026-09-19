import React, { useState, useEffect } from 'react';
import { Project, IncomingLetterReview, ContractClause } from './types/contract';
import { mockProjects } from './data/mockProjects';
import { mockLetters } from './data/mockLetters';
import { mockAlerts, mockClaims } from './data/mockAlertsAndClaims';
import { mockTimeline } from './data/mockTimeline';
import { mockConflicts } from './data/mockConflicts';

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

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activeProject, setActiveProject] = useState<Project>(mockProjects[0]);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatPrompt, setChatPrompt] = useState<string>('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);

  // Project-isolated data
  const projectLetters = mockLetters.filter(l => l.projectId === activeProject.id);
  const [activeLetter, setActiveLetter] = useState<IncomingLetterReview>(projectLetters[0] || mockLetters[0]);

  const projectAlerts = mockAlerts.filter(a => a.projectId === activeProject.id);
  const projectClaims = mockClaims.filter(c => c.projectId === activeProject.id);
  const projectTimeline = mockTimeline.filter(t => t.projectId === activeProject.id);
  const projectConflicts = mockConflicts.filter(c => c.projectId === activeProject.id);

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
    const newLetters = mockLetters.filter(l => l.projectId === proj.id);
    if (newLetters.length > 0) {
      setActiveLetter(newLetters[0]);
    }
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
        />

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={(newProj) => {
            setProjects(prev => [newProj, ...prev]);
            setActiveProject(newProj);
          }}
        />

        <main className="content-viewport">
          <div className="content-container">
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
              />
            )}

            {activeView === 'letter-review' && (
              <LetterReviewStudio
                project={activeProject}
                letter={activeLetter}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
