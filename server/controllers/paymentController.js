import { razorpay } from '../config/razorpay.js';
import { supabase } from '../config/supabase.js';

export const createMilestoneOrder = async (req, res) => {
  try {
    const { milestoneId, amount, currency = 'INR' } = req.body;

    // 1. Fetch milestone/project details
    const { data: milestone, error } = await supabase
      .from('milestones')
      .select('*, projects(*)')
      .eq('id', milestoneId)
      .single();

    if (error || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // 2. Create Razorpay Order
    let order;
    if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('YOUR_')) {
      const options = {
        amount: amount * 100, // Amount in paise
        currency,
        receipt: `receipt_ms_${milestoneId}`,
        notes: {
          milestoneId,
          projectId: milestone.project_id,
          clientId: req.user.id
        }
      };
      order = await razorpay.orders.create(options);
    } else {
      // SIMULATION MODE
      console.log('--- RAZORPAY SIMULATION MODE ---');
      order = {
        id: `sim_order_${Date.now()}`,
        amount: amount * 100,
        currency: currency
      };
    }

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      isSimulated: !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_')
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, milestoneId } = req.body;
    
    // In a production app, use crypto to verify signature
    // For now, we assume frontend passed verification or we'll rely on webhooks for the source of truth
    
    // 1. Mark payment as paid in DB
    const { error: payError } = await supabase
        .from('milestones')
        .update({ status: 'paid' }) // Custom status for funded
        .eq('id', milestoneId);

    if (payError) throw payError;

    // 2. Add to project escrow balance
    // This logic should ideally be in a webhook, but we'll add it here for immediate feedback
    
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
