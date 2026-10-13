import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/contract';
import { defaultUserProfile } from '../../utils/storage';
import { 
  User, 
  X, 
  Briefcase, 
  Mail, 
  Award, 
  Phone, 
  Building2, 
  FileCheck2, 
  Save, 
  RotateCcw,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const ROLE_PRESETS = [
  'Contract Manager',
  'Lead Contracts Engineer',
  'Senior Commercial Manager',
  'Claims & Disputes Specialist',
  'Commercial Director',
  'The Engineer / PMC Representative',
  'Employer Representative',
  'Contractor Project Director',
  'Legal Counsel & Quantum Expert'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(userProfile);
      setSavedNotification(false);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    // Generate initials automatically if name changes
    const parts = name.trim().split(/\s+/);
    let initials = 'CM';
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts[0] && parts[0].length >= 2) {
      initials = parts[0].slice(0, 2).toUpperCase();
    }
    setFormData(prev => ({
      ...prev,
      name,
      avatarInitials: initials
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 700);
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset profile to default Contract Manager credentials?')) {
      setFormData(defaultUserProfile);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
            }}>
              {formData.avatarInitials || 'CM'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                User & Author Signatory Profile
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Saved locally on device. Auto-populates letter signatures, rebuttal drafters, and notice disclaimers.
              </p>
            </div>
          </div>
          <button 
            className="btn-icon" 
            onClick={onClose}
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {savedNotification && (
          <div style={{
            background: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--status-success)',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            <CheckCircle size={18} />
            <span>Profile saved successfully into local browser storage!</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Full Name & Initials */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="var(--accent-blue)" />
                Full Name / Signatory Name
              </label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. John Doe, P.Eng."
              />
            </div>
            <div>
              <label className="form-label">
                Avatar Initials
              </label>
              <input 
                type="text" 
                className="form-input" 
                maxLength={4}
                value={formData.avatarInitials || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, avatarInitials: e.target.value.toUpperCase() }))}
                placeholder="e.g. JD"
                style={{ textAlign: 'center', fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Row 2: Role & Organization */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} color="var(--accent-blue)" />
                Contract Role
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  list="role-suggestions"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Select or enter role"
                />
                <datalist id="role-suggestions">
                  {ROLE_PRESETS.map(r => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={14} color="var(--accent-blue)" />
                Organization / Directorate
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="e.g. Apex JV Commercial Directorate"
              />
            </div>
          </div>

          {/* Row 3: Email & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} color="var(--accent-blue)" />
                Official Email
              </label>
              <input 
                type="email" 
                className="form-input" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. contracts@apex-jv.internal"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} color="var(--accent-blue)" />
                Phone / Ext.
              </label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +1 (555) 019-2834"
              />
            </div>
          </div>

          {/* Row 4: Professional Credentials */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} color="var(--accent-blue)" />
              Professional Credentials & Accreditations
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.credentials || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, credentials: e.target.value }))}
              placeholder="e.g. MRICS, MCIArb, FIDIC Certified Contract Manager"
            />
          </div>

          {/* Row 5: Authority Notes */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCheck2 size={14} color="var(--accent-blue)" />
              Signatory Scope & Delegation of Authority
            </label>
            <textarea 
              className="form-textarea" 
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Authorized signatory for Notice of Claims, Disallowance rebuttals, and contemporary records."
            />
          </div>

          {/* Privacy Notice Banner */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <ShieldAlert size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
            <span>
              Your profile is stored in local browser storage only. No personal identification data is ever sent to external cloud servers.
            </span>
          </div>

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '8px',
            borderTop: '1px solid var(--border-subtle)', 
            paddingTop: '16px' 
          }}>
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ fontSize: '0.8rem', gap: '6px' }}
              onClick={handleResetDefault}
            >
              <RotateCcw size={14} />
              Reset Defaults
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ padding: '8px 24px', gap: '8px' }}
              >
                <Save size={16} />
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
