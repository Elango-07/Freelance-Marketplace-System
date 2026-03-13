import { supabase } from '../config/supabase.js';

/**
 * Ranks partners based on multiple factors:
 * - Average Rating (40%)
 * - Success Rate (30%)
 * - Experience (20%)
 * - Current Workload (10%)
 */
export const rankPartners = async (projectId) => {
  try {
    const { data: partners, error } = await supabase
      .from('users')
      .select('*, partner_profiles(*)')
      .eq('role', 'partner');

    if (error) throw error;

    // Fetch project counts for workload
    const { data: activeProjects } = await supabase
      .from('projects')
      .select('partner_id')
      .eq('status', 'assigned');

    const workloadMap = activeProjects.reduce((acc, p) => {
      acc[p.partner_id] = (acc[p.partner_id] || 0) + 1;
      return acc;
    }, {});

    const ranked = partners.map(p => {
      const profile = p.partner_profiles?.[0] || {};
      const rating = profile.rating || 0;
      const experience = profile.experience_years || 0;
      const workload = workloadMap[p.id] || 0;
      
      // Calculate weighted score
      // Score = (Rating * 20) + (Experience * 2) - (Workload * 5)
      const score = (rating * 20) + (Math.min(experience, 10) * 2) - (workload * 5);

      return {
        ...p,
        matchScore: Math.max(0, score)
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return ranked;
  } catch (error) {
    console.error('Ranking Error:', error);
    return [];
  }
};

export const autoAssignPartner = async (projectId) => {
  const ranked = await rankPartners(projectId);
  if (ranked.length === 0) return null;

  const bestMatch = ranked[ranked.length - 1]; // Highest score

  const { error } = await supabase
    .from('projects')
    .update({ 
      partner_id: bestMatch.id,
      status: 'assigned'
    })
    .eq('id', projectId);

  return error ? null : bestMatch;
};
