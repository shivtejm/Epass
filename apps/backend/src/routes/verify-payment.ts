import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export const verifyPaymentRouter = Router();

// Secret key to protect this webhook endpoint
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'epass-webhook-secret-change-me';

verifyPaymentRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { utr_number, amount, sender_info, secret } = req.body;

    // Validate webhook secret
    if (secret !== WEBHOOK_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!utr_number) {
      res.status(400).json({ error: 'utr_number is required' });
      return;
    }

    console.log(`[Webhook] Received UTR: ${utr_number}, Amount: ${amount}, Sender: ${sender_info}`);

    // Check if this UTR already exists in verifications
    const { data: existingVerification } = await supabaseAdmin
      .from('payment_verifications')
      .select('id')
      .eq('utr_number', utr_number)
      .single();

    if (existingVerification) {
      res.json({ message: 'UTR already processed' });
      return;
    }

    // Store the verified UTR
    const { data: verification } = await supabaseAdmin
      .from('payment_verifications')
      .insert({
        utr_number,
        amount: amount || null,
        sender_info: sender_info || null,
      })
      .select()
      .single();

    // Try to find a pending pass with this UTR and auto-approve it
    const { data: pendingPass } = await supabaseAdmin
      .from('passes')
      .select('id, event_id, attendee_email')
      .eq('utr_number', utr_number)
      .eq('status', 'pending')
      .single();

    if (pendingPass) {
      // Auto-approve the pass
      await supabaseAdmin
        .from('passes')
        .update({ status: 'approved' })
        .eq('id', pendingPass.id);

      // Link verification to pass
      await supabaseAdmin
        .from('payment_verifications')
        .update({ matched_pass_id: pendingPass.id })
        .eq('id', verification?.id);

      // Send email with pass
      try {
        const backendPort = process.env.PORT || 4000;
        await fetch(`http://localhost:${backendPort}/api/send-pass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId: pendingPass.id }),
        });
        console.log(`[Webhook] Auto-approved pass ${pendingPass.id} and sent email`);
      } catch (e) {
        console.error('[Webhook] Email send failed:', e);
      }

      res.json({ 
        message: 'UTR verified and pass auto-approved',
        passId: pendingPass.id 
      });
      return;
    }

    // No matching pass yet — UTR stored for future matching
    res.json({ 
      message: 'UTR stored. Will auto-approve when attendee submits.',
      verificationId: verification?.id 
    });

  } catch (err: any) {
    console.error('[Webhook] Error:', err);
    res.status(500).json({ error: err.message });
  }
});
