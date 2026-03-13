import { supabase } from '../config/supabase.js';
import { rankPartners, autoAssignPartner } from '../services/matchingService.js';

export const getProjectRanking = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ranked = await rankPartners(projectId);
    res.status(200).json(ranked);
  } catch (error) {
    res.status(500).json({ error: 'Failed to rank partners' });
  }
};

export const assignBestPartner = async (req, res) => {
  try {
    const { projectId } = req.body;
    const partner = await autoAssignPartner(projectId);
    if (!partner) return res.status(404).json({ error: 'No partners found' });
    res.status(200).json({ message: 'Partner assigned successfully', partner });
  } catch (error) {
    res.status(500).json({ error: 'Auto-assignment failed' });
  }
};
