import { supabase } from '../config/supabase.js';

export const getWallet = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Wallet not found' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { descending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    
    // 1. Check balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // 2. Create withdrawal request
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: req.user.id,
        amount,
        bank_details: bankDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Deduct from wallet balance (move to pending)
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        balance: wallet.balance - amount,
        pending_balance: (wallet.pending_balance || 0) + amount 
      })
      .eq('user_id', req.user.id);

    if (walletError) throw walletError;

    res.status(201).json({ message: 'Withdrawal request submitted', data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
};
