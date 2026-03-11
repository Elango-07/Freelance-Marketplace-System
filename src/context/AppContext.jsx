import React, { createContext, useState, useEffect, useContext } from 'react';
import { LocalStorage } from '../services/localStorage';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => LocalStorage.get('fb_projects', []));
  const [messages, setMessages] = useState(() => LocalStorage.get('fb_messages', []));
  const [notifications, setNotifications] = useState(() => LocalStorage.get('fb_notifications', []));
  const [activities, setActivities] = useState(() => LocalStorage.get('fb_activities', []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => LocalStorage.get('fb_recent', []));
  const [violations, setViolations] = useState(() => LocalStorage.get('fb_violations', []));
  const [reviews, setReviews] = useState(() => LocalStorage.get('fb_reviews', []));
  const [securityLogs, setSecurityLogs] = useState(() => LocalStorage.get('fb_securityLogs', []));
  const [milestoneGates, setMilestoneGates] = useState(() => LocalStorage.get('fb_milestone_gates', []));
  const [disputes, setDisputes] = useState(() => LocalStorage.get('fb_disputes', []));
  const [chatRestrictions, setChatRestrictions] = useState(() => LocalStorage.get('fb_chat_restrictions', []));
  const [customBlockedWords, setCustomBlockedWords] = useState(() => LocalStorage.get('fb_blocked_words', []));

  useEffect(() => { LocalStorage.set('fb_projects', projects); }, [projects]);
  useEffect(() => { LocalStorage.set('fb_messages', messages); }, [messages]);
  useEffect(() => { LocalStorage.set('fb_notifications', notifications); }, [notifications]);
  useEffect(() => { LocalStorage.set('fb_activities', activities); }, [activities]);
  useEffect(() => { LocalStorage.set('fb_recent', recentlyViewed); }, [recentlyViewed]);
  useEffect(() => { LocalStorage.set('fb_violations', violations); }, [violations]);
  useEffect(() => { LocalStorage.set('fb_reviews', reviews); }, [reviews]);
  useEffect(() => { LocalStorage.set('fb_securityLogs', securityLogs); }, [securityLogs]);
  useEffect(() => { LocalStorage.set('fb_milestone_gates', milestoneGates); }, [milestoneGates]);
  useEffect(() => { LocalStorage.set('fb_disputes', disputes); }, [disputes]);
  useEffect(() => { LocalStorage.set('fb_chat_restrictions', chatRestrictions); }, [chatRestrictions]);
  useEffect(() => { LocalStorage.set('fb_blocked_words', customBlockedWords); }, [customBlockedWords]);

  // --- Core Utility Functions (Top Level) ---

  const logSecurityEvent = (event) => {
    const newEvent = { id: Date.now(), timestamp: new Date().toISOString(), ...event };
    setSecurityLogs(prev => [newEvent, ...prev].slice(0, 100));
  };

  const logActivity = (type, message, details = {}) => {
    const newActivity = { id: Date.now(), type, message, details, timestamp: new Date().toISOString() };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const addNotification = (notif) => {
    const newNotif = { 
      id: Date.now(), 
      userId: notif.userId,
      title: notif.title || 'New Notification',
      message: notif.content || notif.message,
      type: notif.type || 'info', 
      isRead: false,
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      projectId: notif.projectId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = (userId) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearOldNotifications = () => {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    setNotifications(prev => prev.filter(n => new Date(n.timestamp).getTime() > thirtyDaysAgo));
  };

  useEffect(() => {
    clearOldNotifications();
  }, []);

  // ─── Content Moderation Engine ────────────────────────────────────────────────
  // Expanded regex: 10-digit phone, email, GitHub/GDrive/Dropbox/social URLs
  const BLOCKED_PATTERNS = [
    { type: 'phone',  label: 'phone number',    regex: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
    { type: 'email',  label: 'email address',   regex: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/ },
    { type: 'link',   label: 'external link',   regex: /\b(https?:\/\/|www\.)[^\s]+\b/ },
    { type: 'social', label: 'social media link', regex: /\b(instagram|twitter|facebook|linkedin|telegram|whatsapp|t\.me|wa\.me|fb\.com|tiktok)\.?[\s\S]{0,30}\b/i },
    { type: 'github', label: 'GitHub link',     regex: /\bgithub\.com\b/i },
    { type: 'drive',  label: 'file sharing link', regex: /\b(drive\.google\.com|dropbox\.com|onedrive\.live|mega\.nz|wetransfer\.com)\b/i },
  ];

  const moderationCheck = (text) => {
    const violations = [];
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.regex.test(text)) violations.push(pattern.label);
    }
    // Check admin-defined custom blocked words / formats
    for (const word of customBlockedWords) {
      if (!word.trim()) continue;
      try {
        // Try treating the word as a regex first, fallback to plain word match
        const rx = word.startsWith('/') ? new RegExp(word.slice(1, word.lastIndexOf('/')), 'i') : new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (rx.test(text)) violations.push(`blocked word: "${word}"`);
      } catch { /* invalid regex — skip */ }
    }
    return violations;
  };

  // Admin: add / remove custom blocked words
  const addBlockedWord = (word) => {
    const trimmed = word.trim();
    if (!trimmed || customBlockedWords.includes(trimmed)) return;
    setCustomBlockedWords(prev => [...prev, trimmed]);
  };

  const removeBlockedWord = (word) => {
    setCustomBlockedWords(prev => prev.filter(w => w !== word));
  };

  // Returns { restricted: bool, flagged: bool, violationCount: number } for a user
  const getChatStatus = (userId) => {
    const userViolations = violations.filter(v => v.senderId === userId);
    const count = userViolations.length;
    const restriction = chatRestrictions.find(r => r.userId === userId);
    return {
      violationCount: count,
      restricted: restriction?.restricted || false,
      flagged: restriction?.flagged || false,
      restrictedUntil: restriction?.restrictedUntil || null,
    };
  };

  // --- Feature Functions ---

  const addProject = (projectDetails, user) => {
    if (!user?.isVerified && user?.role === 'Client') {
      return { success: false, message: 'Please verify your email to create projects.' };
    }
    const newProject = {
      ...projectDetails,
      id: Date.now(),
      status: 'Active',
      progress: 0,
      category: projectDetails.category || 'Web Development',
      priority: projectDetails.priority || 'Medium',
      milestones: [{ stage: 'Planning', progress: 0, timestamp: new Date().toISOString() }],
      files: [],
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    logActivity('project_created', `Project "${newProject.title}" was created.`, { projectId: newProject.id });
    addNotification({ 
      userId: 'admin', 
      type: 'Project Update', 
      title: 'New Project Request',
      message: `A new project "${newProject.title}" has been created by ${user.name}.`,
      projectId: newProject.id 
    });
    return { success: true, project: newProject };
  };

  const updateProject = (projectId, updates) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
    logActivity('project_updated', 'Project details were updated.', { projectId });
  };

  const deleteProject = (projectId, adminId) => {
    setProjects(prev => {
      const project = prev.find(p => p.id === projectId);
      if (adminId) {
        logSecurityEvent({
          type: 'project_deletion',
          adminId,
          details: `Admin deleted project "${project?.title}"`,
          severity: 'medium'
        });
      }
      logActivity('project_deleted', `Project "${project?.title}" was removed.`, { projectId });
      return prev.filter(p => p.id !== projectId);
    });
  };

  const assignPartner = (projectId, partnerId, partnerName) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, partnerId, partnerName } : p));
    logActivity('partner_assigned', `Partner "${partnerName}" assigned to project.`, { projectId, partnerId });
    addNotification({
      userId: partnerId,
      type: 'Project Update',
      title: 'New Project Assigned',
      message: `You have been assigned to the project "${projects.find(p => p.id === projectId)?.title}".`,
      projectId
    });
  };

  const updateProjectProgress = (projectId, newProgress) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const oldStatus = p.status;
        const updated = { ...p, progress: newProgress };
        let stage = 'Planning';
        if (newProgress >= 100) { updated.status = 'Completed'; stage = 'Completed'; }
        else if (newProgress >= 75) stage = 'Testing';
        else if (newProgress >= 50) stage = 'Development';
        else if (newProgress >= 25) stage = 'Planning';

        const lastMilestone = p.milestones[p.milestones.length - 1];
        if (lastMilestone.stage !== stage || lastMilestone.progress !== newProgress) {
           updated.milestones = [...p.milestones, { stage, progress: newProgress, timestamp: new Date().toISOString() }];
        }
        logActivity('project_updated', `Project "${p.title}" progress updated to ${newProgress}%.`, { projectId, newProgress });
        if (updated.status !== oldStatus) {
           logActivity('status_changed', `Project "${p.title}" status changed to ${updated.status}.`, { projectId, status: updated.status });
           addNotification({ 
             userId: p.clientId, 
             type: 'Project Update', 
             title: 'Project Status Update',
             message: `Project "${p.title}" is now ${updated.status}!`, 
             projectId 
           });
           if (updated.status === 'Completed' && p.partnerId) {
             addNotification({
               userId: p.partnerId,
               type: 'Project Update',
               title: 'Project Completed',
               message: `Great job! Project "${p.title}" has been marked as completed.`,
               projectId
             });
           }
        }
        return updated;
      }
      return p;
    }));
  };

  const addFileToProject = (projectId, file, uploader) => {
    const newFile = { 
      ...file, 
      id: Date.now(), 
      projectId, 
      uploaderId: uploader.id, 
      uploaderName: uploader.name,
      uploadDate: new Date().toISOString() 
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, files: [...(p.files || []), newFile] } : p));
    logActivity('file_uploaded', `File "${file.name}" was uploaded by ${uploader.name}.`, { projectId, fileName: file.name });
    
    // Notify the other party
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const recipientId = uploader.id === project.clientId ? project.partnerId : project.clientId;
      if (recipientId) {
        addNotification({
          userId: recipientId,
          type: 'Project Update',
          title: 'New File Uploaded',
          message: `${uploader.name} uploaded a new file: ${file.name}`,
          projectId
        });
      }
    }
  };

  const renameFile = (projectId, fileId, newName) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      files: p.files.map(f => f.id === fileId ? { ...f, name: newName } : f)
    } : p));
    logActivity('file_renamed', `File was renamed to "${newName}".`, { projectId, fileId });
  };

  const deleteFile = (projectId, fileId, userName) => {
    setProjects(prev => prev.map(p => p.id === projectId ? {
      ...p,
      files: p.files.filter(f => f.id !== fileId)
    } : p));
    logActivity('file_deleted', `File was deleted by ${userName}.`, { projectId, fileId });
  };

  // ─── Milestone Gate System ───────────────────────────────────────────────────

  const MILESTONE_STAGES = [
    { stage: 25, label: 'Planning' },
    { stage: 50, label: 'Development' },
    { stage: 75, label: 'Testing' },
    { stage: 100, label: 'Delivery' },
  ];
  const AUTO_APPROVE_DAYS = 5;

  const initMilestoneGates = (projectId) => {
    const existing = milestoneGates.filter(g => g.projectId === projectId);
    if (existing.length === 4) return; // already initialised
    const gates = MILESTONE_STAGES.map((s, i) => ({
      id: `${projectId}-${s.stage}`,
      projectId,
      milestoneStage: s.stage,
      label: s.label,
      status: 'Pending',          // Pending | Submitted | Revision Requested | Approved | Disputed | Completed
      locked: i !== 0,            // only 25% unlocked by default
      revisionCount: 0,
      revisions: [],              // [{ comment, date }]
      submittedDate: null,
      approvedDate: null,
    }));
    setMilestoneGates(prev => {
      const filtered = prev.filter(g => g.projectId !== projectId);
      return [...filtered, ...gates];
    });
  };

  const getProjectGates = (projectId) =>
    MILESTONE_STAGES.map(s => {
      const found = milestoneGates.find(g => g.projectId === projectId && g.milestoneStage === s.stage);
      return found || { id: `${projectId}-${s.stage}`, projectId, milestoneStage: s.stage, label: s.label, status: 'Pending', locked: s.stage !== 25, revisionCount: 0, revisions: [], submittedDate: null, approvedDate: null };
    });

  const submitMilestone = (projectId, stage, user) => {
    setMilestoneGates(prev => prev.map(g => {
      if (g.projectId !== projectId || g.milestoneStage !== stage) return g;
      if (g.locked) return g;
      return { ...g, status: 'Submitted', submittedDate: new Date().toISOString() };
    }));
    logActivity('milestone_submitted', `Milestone ${stage}% submitted by ${user.name}.`, { projectId, stage });
    const project = projects.find(p => p.id === projectId);
    if (project?.clientId) {
      addNotification({
        userId: project.clientId,
        type: 'Milestone',
        title: `Milestone ${stage}% Submitted`,
        message: `${user.name} submitted work for the ${stage}% milestone. Please review.`,
        projectId,
      });
    }
  };

  const approveMilestone = (projectId, stage, user) => {
    setMilestoneGates(prev => {
      const nextStage = MILESTONE_STAGES.find(s => s.stage > stage)?.stage;
      return prev.map(g => {
        if (g.projectId !== projectId) return g;
        if (g.milestoneStage === stage) return { ...g, status: 'Approved', approvedDate: new Date().toISOString() };
        if (g.milestoneStage === nextStage) return { ...g, locked: false }; // unlock next
        return g;
      });
    });
    updateProjectProgress(projectId, stage);
    logActivity('milestone_approved', `Milestone ${stage}% approved by ${user.name}.`, { projectId, stage });
    const project = projects.find(p => p.id === projectId);
    if (project?.partnerId) {
      addNotification({
        userId: project.partnerId,
        type: 'Milestone',
        title: `Milestone ${stage}% Approved! 🎉`,
        message: `Your ${stage}% milestone was approved. ${stage < 100 ? 'You can now work on the next stage.' : 'Great job!'}`,
        projectId,
      });
    }
  };

  const requestRevision = (projectId, stage, comment, user) => {
    setMilestoneGates(prev => prev.map(g => {
      if (g.projectId !== projectId || g.milestoneStage !== stage) return g;
      const newRevisions = [...(g.revisions || []), { comment, date: new Date().toISOString(), by: user.name }];
      const newCount = (g.revisionCount || 0) + 1;
      return {
        ...g,
        status: newCount >= 3 ? 'Revision Requested' : 'Revision Requested',
        revisionCount: newCount,
        revisions: newRevisions,
      };
    }));
    logActivity('revision_requested', `Revision requested for milestone ${stage}% by ${user.name}.`, { projectId, stage });
    const project = projects.find(p => p.id === projectId);
    if (project?.partnerId) {
      addNotification({
        userId: project.partnerId,
        type: 'Milestone',
        title: `Revision Requested — ${stage}% Milestone`,
        message: comment,
        projectId,
      });
    }
  };

  const openDispute = (projectId, stage, reason, user) => {
    const newDispute = {
      id: Date.now(),
      projectId,
      milestoneStage: stage,
      disputeReason: reason,
      openedBy: user.id,
      openedByName: user.name,
      status: 'Open',
      createdDate: new Date().toISOString(),
    };
    setDisputes(prev => [...prev, newDispute]);
    setMilestoneGates(prev => prev.map(g =>
      g.projectId === projectId && g.milestoneStage === stage
        ? { ...g, status: 'Disputed' }
        : g
    ));
    addNotification({
      userId: 'admin',
      type: 'Dispute',
      title: `⚠️ Dispute Opened — Project Milestone ${stage}%`,
      message: `${user.name} opened a dispute: "${reason}". Admin review required.`,
      projectId,
    });
    logActivity('dispute_opened', `Dispute opened for milestone ${stage}% by ${user.name}.`, { projectId, stage });
  };

  const resolveDispute = (disputeId, action, adminId) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (!dispute) return;
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Resolved', resolvedBy: adminId, resolvedDate: new Date().toISOString(), resolution: action } : d));
    if (action === 'approve') {
      approveMilestone(dispute.projectId, dispute.milestoneStage, { name: 'Admin' });
    } else {
      setMilestoneGates(prev => prev.map(g =>
        g.projectId === dispute.projectId && g.milestoneStage === dispute.milestoneStage
          ? { ...g, status: 'Revision Requested' }
          : g
      ));
    }
    logActivity('dispute_resolved', `Dispute for milestone ${dispute.milestoneStage}% resolved by admin (${action}).`, { projectId: dispute.projectId });
  };

  // Auto-approval: run on mount — safely outside state setters
  useEffect(() => {
    const now = Date.now();
    const threshold = AUTO_APPROVE_DAYS * 24 * 60 * 60 * 1000;

    const gatesToApprove = milestoneGates.filter(g => {
      if (g.status !== 'Submitted' || !g.submittedDate) return false;
      const age = now - new Date(g.submittedDate).getTime();
      return age >= threshold;
    });

    if (gatesToApprove.length === 0) return;

    // 1. Update gate statuses
    setMilestoneGates(prev => prev.map(g => {
      const shouldApprove = gatesToApprove.some(a => a.id === g.id);
      return shouldApprove ? { ...g, status: 'Approved', approvedDate: new Date().toISOString() } : g;
    }));

    // 2. Side effects — notifications & progress updates
    gatesToApprove.forEach(g => {
      const proj = projects.find(p => p.id === g.projectId);
      if (!proj) return;
      if (proj.partnerId) {
        addNotification({
          userId: proj.partnerId,
          type: 'Milestone',
          title: `Milestone ${g.milestoneStage}% Auto-Approved`,
          message: `Your ${g.milestoneStage}% milestone was automatically approved after ${AUTO_APPROVE_DAYS} days.`,
          projectId: g.projectId,
        });
      }
      updateProjectProgress(g.projectId, g.milestoneStage);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount only

  const logRecentlyViewed = (projectId) => {
    setRecentlyViewed(prev => [projectId, ...prev.filter(id => id !== projectId)].slice(0, 5));
  };

  const banUser = (targetUserId, adminId, reason) => {
    logSecurityEvent({ type: 'user_ban', adminId, targetUserId, details: `User banned: ${reason}`, severity: 'high' });
  };

  const sendMessage = (projectId, senderId, receiverId, text, attachment = null) => {
    // 1. Moderation check
    const violationList = moderationCheck(text);
    if (violationList.length > 0) {
      const violation = {
        id: Date.now(),
        senderId, projectId, text,
        violations: violationList,
        timestamp: new Date().toISOString(),
        flagged: true,
      };
      setViolations(prev => {
        const updated = [violation, ...prev];
        // Count this user's violations
        const userCount = updated.filter(v => v.senderId === senderId).length;

        // Apply auto‑moderation tiers
        setChatRestrictions(prevR => {
          const existing = prevR.find(r => r.userId === senderId) || { userId: senderId, restricted: false, flagged: false };
          let updated2 = { ...existing };
          if (userCount === 1) {
            // Tier 1 — warning (just notify, no restriction)
            addNotification({ userId: senderId, type: 'Security', title: '⚠️ Policy Warning', message: 'Sharing contact info is not allowed on this platform. Repeated violations will restrict your account.' });
          } else if (userCount === 2) {
            // Tier 2 — 24-hour chat restriction
            const restrictedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            updated2 = { ...updated2, restricted: true, restrictedUntil };
            addNotification({ userId: senderId, type: 'Security', title: '🚫 Chat Restricted', message: 'Your chat has been temporarily restricted for 24 hours due to repeated policy violations.' });
          } else if (userCount >= 3) {
            // Tier 3 — flagged for admin review
            updated2 = { ...updated2, flagged: true };
            addNotification({ userId: 'admin', type: 'Security', title: '🚨 User Flagged', message: `User ${senderId} has been flagged for repeated chat policy violations. Please review.` });
          }
          return prevR.some(r => r.userId === senderId)
            ? prevR.map(r => r.userId === senderId ? updated2 : r)
            : [...prevR, updated2];
        });

        return updated;
      });
      logSecurityEvent({ type: 'policy_violation', userId: senderId, details: `Chat violation: ${violationList.join(', ')}`, severity: 'medium' });
      return { error: `🚫 Restricted content detected (${violationList.join(', ')}). Sharing external contact info violates platform policy.` };
    }

    // 2. Check if user is currently restricted
    const restriction = chatRestrictions.find(r => r.userId === senderId);
    if (restriction?.restricted && restriction.restrictedUntil) {
      const until = new Date(restriction.restrictedUntil).getTime();
      if (Date.now() < until) {
        const mins = Math.ceil((until - Date.now()) / 60000);
        return { error: `Chat restricted. Try again in ${mins} minutes.` };
      } else {
        // Restriction expired — lift it
        setChatRestrictions(prev => prev.map(r => r.userId === senderId ? { ...r, restricted: false, restrictedUntil: null } : r));
      }
    }

    const newMessage = {
      id: Date.now(), projectId, senderId, receiverId, text, attachment,
      read: false, delivered: true,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    addNotification({ 
      userId: receiverId, 
      type: 'Message Alert', 
      title: 'New Message',
      message: text.length > 60 ? text.slice(0, 57) + '…' : text, 
      projectId 
    });
    return { success: true };
  };

  const editMessage = (messageId, newText) => {
    const violationList = moderationCheck(newText);
    if (violationList.length > 0) return { error: `Restricted content: ${violationList.join(', ')}.` };
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const diff = (Date.now() - new Date(m.timestamp).getTime()) / 1000 / 60;
        if (diff > 5) return m; // Window expired
        return { ...m, text: newText, edited: true };
      }
      return m;
    }));
    return { success: true };
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const markConversationRead = (projectId, userId) => {
    setMessages(prev => prev.map(m => (m.projectId === projectId && m.receiverId === userId) ? { ...m, read: true } : m));
  };


  const addReview = (reviewData) => {
    const newReview = { ...reviewData, id: Date.now(), date: new Date().toISOString() };
    setReviews(prev => [newReview, ...prev]);
    addNotification({ 
      userId: reviewData.targetId, 
      type: 'System Alert', 
      title: 'New Review Received',
      message: `You received a new ${reviewData.rating}-star review!` 
    });
  };

  const deleteReview = (reviewId) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const getReputationData = (userId) => {
    const userReviews = reviews.filter(r => r.targetId === userId);
    const avgRating = userReviews.length > 0 
      ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
      : 0;
    const userProjects = projects.filter(p => p.partnerId === userId || p.clientId === userId);
    const completedCount = userProjects.filter(p => p.status === 'Completed').length;
    const successRate = userProjects.length > 0 ? Math.round((completedCount / userProjects.length) * 100) : 0;
    const rawScore = (parseFloat(avgRating) * 15) + (completedCount * 2);
    const score = Math.min(Math.round(rawScore), 100);
    const badges = [];
    if (avgRating >= 4.5 && userReviews.length >= 3) badges.push('Top Rated');
    if (completedCount >= 5) badges.push('Trusted Partner');
    if (successRate >= 95 && completedCount >= 2) badges.push('Verified Skills');
    return { avgRating: parseFloat(avgRating), reviewCount: userReviews.length, completedCount, successRate, score, badges, recentReviews: userReviews.slice(0, 5) };
  };

  return (
    <AppContext.Provider value={{
      projects, addProject, updateProject, deleteProject, assignPartner, updateProjectProgress, addFileToProject, renameFile, deleteFile,
      messages, sendMessage, editMessage, deleteMessage, markConversationRead,
      notifications, addNotification, markNotificationRead, markAllNotificationsAsRead, deleteNotification,
      activities, logActivity, recentlyViewed, logRecentlyViewed,
      violations, chatRestrictions, getChatStatus, securityLogs, logSecurityEvent, banUser,
      customBlockedWords, addBlockedWord, removeBlockedWord,
      reviews, addReview, deleteReview, getReputationData,
      milestoneGates, disputes, initMilestoneGates, getProjectGates, submitMilestone, approveMilestone, requestRevision, openDispute, resolveDispute,
    }}>
      {children}
    </AppContext.Provider>
  );
};
