import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // 1. Verify Signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload.payment.entity;

  if (event === 'payment.captured') {
    const { milestoneId, projectId } = payload.notes;
    const amount = payload.amount / 100; // back to INR

    // 2. Update Milestone status
    await supabase
      .from('milestones')
      .update({ status: 'funded' })
      .eq('id', milestoneId);

    // 3. Update Project escrow balance
    const { data: project } = await supabase
      .from('projects')
      .select('escrow_balance')
      .eq('id', projectId)
      .single();

    await supabase
      .from('projects')
      .update({ escrow_balance: (project.escrow_balance || 0) + amount })
      .eq('id', projectId);

    // 4. Log Transaction
    await supabase.from('transactions').insert({
      user_id: payload.notes.clientId,
      type: 'escrow_hold',
      amount,
      description: `Milestone funded for project: ${projectId}`,
      reference_id: milestoneId
    });
  }

  res.status(200).json({ status: 'ok' });
};
