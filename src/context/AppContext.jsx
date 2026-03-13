import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { LocalStorage } from '../services/localStorage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => LocalStorage.get('fb_recent', []));
  const [violations, setViolations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [milestoneGates, setMilestoneGates] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [chatRestrictions, setChatRestrictions] = useState(() => LocalStorage.get('fb_chat_restrictions', []));
  const [customBlockedWords, setCustomBlockedWords] = useState(() => LocalStorage.get('fb_blocked_words', []));
  const [loading, setLoading] = useState(true);

  // Persistence for secondary local-only data
  useEffect(() => { LocalStorage.set('fb_activities', activities); }, [activities]);
  useEffect(() => { LocalStorage.set('fb_recent', recentlyViewed); }, [recentlyViewed]);
  useEffect(() => { LocalStorage.set('fb_securityLogs', securityLogs); }, [securityLogs]);
  useEffect(() => { LocalStorage.set('fb_chat_restrictions', chatRestrictions); }, [chatRestrictions]);
  useEffect(() => { LocalStorage.set('fb_blocked_words', customBlockedWords); }, [customBlockedWords]);

  // --- Content Moderation Engine ---
  const BLOCKED_PATTERNS = [
    { type: 'phone',  label: 'phone number',    regex: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
    { type: 'email',  label: 'email address',   regex: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/ },
    { type: 'link',   label: 'external link',   regex: /\b(https?:\/\/|www\.)[^\s]+\b/ },
    { type: 'social', label: 'social media link', regex: /\b(instagram|twitter|facebook|linkedin|telegram|whatsapp|t\.me|wa\.me|fb\.com|tiktok)\.?[\s\S]{0,30}\b/i },
    { type: 'github', label: 'GitHub link',     regex: /\bgithub\.com\b/i },
    { type: 'drive',  label: 'file sharing link', regex: /\b(drive\.google\.com|dropbox\.com|onedrive\.live|mega\.nz|wetransfer\.com)\b/i },
  ];

  const moderationCheck = (text) => {
    const violationList = [];
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.regex.test(text)) violationList.push(pattern.label);
    }
    for (const word of customBlockedWords) {
      if (!word.trim()) continue;
      const rx = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (rx.test(text)) violationList.push(`blocked word: "${word}"`);
    }
    return violationList;
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Fetch Projects
    let query = supabase.from('projects').select('*');
    if (user.role !== 'admin') {
      query = query.or(`client_id.eq.${user.id},partner_id.eq.${user.id}`);
    }
    const { data: projs } = await query;
    if (projs) setProjects(projs.map(mapProject));

    // Fetch Milestones
    const projectIds = projs?.map(p => p.id) || [];
    if (projectIds.length > 0) {
      const { data: mstones } = await supabase.from('milestones').select('*').in('project_id', projectIds);
      if (mstones) setMilestoneGates(mstones);

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs.map(mapMessage));
    }

    // Fetch Notifications
    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { descending: true });
    if (notifs) setNotifications(notifs.map(mapNotification));

    // Fetch Reviews
    const { data: revs } = await supabase.from('reviews').select('*');
    if (revs) setReviews(revs);

    // Fetch Activities
    const { data: acts } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { descending: true })
      .limit(50);
    if (acts) {
      setActivities(acts);
      setSecurityLogs(acts.filter(a => a.severity === 'high' || a.severity === 'medium'));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;

    // Real-time Subscriptions
    const projectSub = supabase
      .channel('projects_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects(prev => [...prev, mapProject(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? mapProject(payload.new) : p));
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    const milestoneSub = supabase
      .channel('milestones_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMilestoneGates(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setMilestoneGates(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
        }
      })
      .subscribe();

    const messageSub = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.new.receiver_id === user.id || payload.new.sender_id === user.id) {
          setMessages(prev => [...prev, mapMessage(payload.new)]);
        }
      })
      .subscribe();

    const notificationSub = supabase
      .channel('notifications_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.new?.user_id === user.id) {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [mapNotification(payload.new), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? mapNotification(payload.new) : n));
          }
        }
      })
      .subscribe();

    const activitySub = supabase
      .channel('activities_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setActivities(prev => [payload.new, ...prev].slice(0, 50));
        if (payload.new.severity === 'high' || payload.new.severity === 'medium') {
          setSecurityLogs(prev => [payload.new, ...prev].slice(0, 100));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectSub);
      supabase.removeChannel(milestoneSub);
      supabase.removeChannel(messageSub);
      supabase.removeChannel(notificationSub);
      supabase.removeChannel(activitySub);
    };
  }, [user, fetchData]);

  // --- Milestone Gates Logic ---
  const MILESTONE_STAGES = [
    { stage: 25, label: 'Planning' },
    { stage: 50, label: 'Development' },
    { stage: 75, label: 'Testing' },
    { stage: 100, label: 'Delivery' },
  ];

  const initMilestoneGates = async (projectId) => {
    const existing = milestoneGates.filter(g => g.project_id === projectId);
    if (existing.length === 4) return;

    const milestonesToCreate = MILESTONE_STAGES.map(s => ({
      project_id: projectId,
      title: s.label,
      percentage: s.stage,
      status: 'pending'
    }));

    const { error } = await supabase.from('milestones').insert(milestonesToCreate);
    if (error) console.error('Error initializing milestones:', error);
  };

  const getProjectGates = (projectId) => {
    return MILESTONE_STAGES.map(s => {
      const found = milestoneGates.find(g => g.project_id === projectId && g.percentage === s.stage);
      return found ? {
        id: found.id,
        projectId: found.project_id,
        milestoneStage: found.percentage,
        label: found.title,
        status: found.status.charAt(0).toUpperCase() + found.status.slice(1),
        submittedDate: found.created_at, // Use created_at as a proxy for now or add a column
        approvedDate: null 
      } : { 
        id: `${projectId}-${s.stage}`, 
        projectId, 
        milestoneStage: s.stage, 
        label: s.label, 
        status: 'Pending', 
        locked: s.stage !== 25 
      };
    });
  };

  const submitMilestone = async (projectId, stage, user) => {
    const gate = milestoneGates.find(g => g.project_id === projectId && g.percentage === stage);
    if (!gate) return;

    const { error } = await supabase.from('milestones')
      .update({ status: 'submitted' })
      .eq('id', gate.id);
    
    if (error) console.error('Error submitting milestone:', error);
  };

  const approveMilestone = async (projectId, stage, user) => {
    const gate = milestoneGates.find(g => g.project_id === projectId && g.percentage === stage);
    if (!gate) return;

    const { error } = await supabase.from('milestones')
      .update({ status: 'approved' })
      .eq('id', gate.id);

    if (error) console.error('Error approving milestone:', error);
    
    // Also update project progress
    updateProject(projectId, { progress: stage });
  };

  const requestRevision = async (projectId, stage, comment, user) => {
    const gate = milestoneGates.find(g => g.project_id === projectId && g.percentage === stage);
    if (!gate) return;

    const { error } = await supabase.from('milestones')
      .update({ status: 'pending' }) // Reset to pending for revision
      .eq('id', gate.id);
    
    if (error) console.error('Error requesting revision:', error);
  };

  const openDispute = async (projectId, stage, reason, user) => {
    const { error } = await supabase.from('disputes').insert({
      project_id: projectId,
      opened_by: user.id,
      reason: reason,
      status: 'open'
    });
    if (error) console.error('Error opening dispute:', error);
  };

  const resolveDispute = async (disputeId, action, resolverId) => {
    const status = action === 'approve' ? 'resolved' : 'dismissed';
    const { error } = await supabase.from('disputes')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', disputeId);
    
    if (error) {
      console.error('Error resolving dispute:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  // --- Core Utility Functions ---

  const logSecurityEvent = async (event) => {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: user?.id,
      type: event.type,
      message: event.details,
      severity: event.severity || 'info',
      details: event
    });
    if (error) console.error('Error logging security event:', error);
  };

  const logActivity = async (type, message, details = {}) => {
    const { error } = await supabase.from('activity_logs').insert({
      user_id: user?.id,
      type,
      message,
      details,
      severity: 'info'
    });
    if (error) console.error('Error logging activity:', error);
  };

  const addNotification = async (notif) => {
    const { error } = await supabase.from('notifications').insert({
      user_id: notif.userId,
      title: notif.title || 'New Notification',
      description: notif.content || notif.message,
      type: notif.type || 'info',
      project_id: notif.projectId,
      read: false
    });
    if (error) console.error('Error adding notification:', error);
  };

  const markNotificationRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) console.error('Error marking notification read:', error);
  };

  const markAllNotificationsAsRead = async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    if (error) console.error('Error marking all notifications read:', error);
  };

  const deleteNotification = async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) console.error('Error deleting notification:', error);
  };

  // --- Feature Functions ---

  const addProject = async (projectDetails, user) => {
    if (!user?.verified && user?.role === 'client') {
      return { success: false, message: 'Please verify your email to create projects.' };
    }
    const { data, error } = await supabase.from('projects').insert({
      title: projectDetails.title,
      description: projectDetails.description,
      budget: projectDetails.budget,
      client_id: user.id,
      category: projectDetails.category || 'Web Development',
      priority: projectDetails.priority || 'Medium',
      status: 'open'
    }).select().single();

    if (error) return { success: false, message: error.message };

    logActivity('project_created', `Project "${data.title}" was created.`, { projectId: data.id });
    return { success: true, project: mapProject(data) };
  };

  const updateProject = async (projectId, updates) => {
    const dbUpdates = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status.toLowerCase();
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', projectId);
    if (error) console.error('Error updating project:', error);
  };

  const deleteProject = async (projectId, adminId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) console.error('Error deleting project:', error);
  };

  const assignPartner = async (projectId, partnerId, partnerName) => {
    const { error } = await supabase.from('projects').update({
      partner_id: partnerId,
      partner_name: partnerName,
      status: 'assigned'
    }).eq('id', projectId);

    if (error) {
      console.error('Error assigning partner:', error);
      return;
    }

    addNotification({
      userId: partnerId,
      type: 'Project Update',
      title: 'New Project Assigned',
      message: `You have been assigned to a new project.`,
      projectId
    });
  };

  const sendMessage = async (projectId, senderId, receiverId, text, attachment = null) => {
    const violations = moderationCheck(text);
    if (violations.length > 0) {
      return { success: false, error: `🚫 Restricted content detected: ${violations.join(', ')}. Please keep contact details within the platform.` };
    }

    const { data, error } = await supabase.from('messages').insert({
      project_id: projectId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: text,
      attachment_url: attachment
    }).select().single();

    if (error) return { success: false, message: error.message };
    return { success: true, message: mapMessage(data) };
  };

  const markConversationRead = async (projectId, userId) => {
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('project_id', projectId)
      .eq('receiver_id', userId);
  };

  const addReview = async (reviewData) => {
    const { error } = await supabase.from('reviews').insert({
      project_id: reviewData.projectId,
      client_id: reviewData.clientId || user.id,
      partner_id: reviewData.targetId,
      rating: reviewData.rating,
      comment: reviewData.comment
    });

    if (error) {
      console.error('Error adding review:', error);
      return { success: false, error };
    }

    addNotification({
      userId: reviewData.targetId,
      type: 'System Alert',
      title: 'New Review Received',
      message: `You received a new ${reviewData.rating}-star review!`
    });
    return { success: true };
  };

  const deleteReview = async (reviewId) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) console.error('Error deleting review:', error);
  };

  const logRecentlyViewed = (projectId) => {
    setRecentlyViewed(prev => [projectId, ...prev.filter(id => id !== projectId)].slice(0, 5));
  };

  const addBlockedWord = (word) => {
    if (!customBlockedWords.includes(word)) {
      setCustomBlockedWords(prev => [...prev, word]);
    }
  };

  const removeBlockedWord = (word) => {
    setCustomBlockedWords(prev => prev.filter(w => w !== word));
  };

  const getReputationData = (userId) => {
    const userReviews = reviews.filter(r => r.partner_id === userId || r.client_id === userId);
    const avgRating = userReviews.length > 0 
      ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
      : 0;
    const userProjects = projects.filter(p => p.partnerId === userId || p.clientId === userId);
    const completedCount = userProjects.filter(p => p.status === 'Completed').length;
    const successRate = userProjects.length > 0 ? Math.round((completedCount / userProjects.length) * 100) : 0;
    
    // Calculate simple reputation score
    const score = Math.min(Math.round((parseFloat(avgRating) * 15) + (completedCount * 2)), 100);

    const badges = [];
    if (score >= 80) badges.push('top_rated');
    if (completedCount >= 5) badges.push('pro_partner');
    if (userReviews.length >= 10) badges.push('trusted');

    return { 
      avgRating: parseFloat(avgRating), 
      reviewCount: userReviews.length, 
      completedCount, 
      successRate,
      score,
      badges,
      recentReviews: userReviews.slice(0, 5) 
    };
  };

  return (
    <AppContext.Provider value={{
      projects, addProject, updateProject, deleteProject, assignPartner, 
      messages, sendMessage, markConversationRead,
      notifications, addNotification, markNotificationRead, markAllNotificationsAsRead, deleteNotification,
      activities, logActivity, recentlyViewed, logRecentlyViewed,
      securityLogs, logSecurityEvent,
      violations, chatRestrictions,
      customBlockedWords, setCustomBlockedWords, addBlockedWord, removeBlockedWord,
      reviews, addReview, deleteReview, getReputationData,
      milestoneGates, disputes, initMilestoneGates, getProjectGates, submitMilestone, approveMilestone, requestRevision, openDispute, resolveDispute,
      isLoading: loading
    }}>
      {children}
    </AppContext.Provider>
  );
};
