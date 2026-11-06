import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export const submitPassRouter = Router();

submitPassRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { utr_number, event_id, attendee_name, attendee_email, attendee_phone, attendee_id } = req.body;

    if (!utr_number || !event_id || !attendee_name || !attendee_email) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 1. Check if UTR is already used by another pass
    const { data: existingPass } = await supabaseAdmin
      .from('passes')
      .select('id')
      .eq('utr_number', utr_number)
      .single();

    if (existingPass) {
      res.status(400).json({ error: 'This UTR has already been used for another pass.' });
      return;
    }

    // 2. Generate pass details
    const passNumber = `EP-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const qrData = `epass_verify:${event_id}:${passNumber}`;

    // 3. Check if this UTR was already verified via Gmail webhook
    const { data: verification } = await supabaseAdmin
      .from('payment_verifications')
      .select('id')
      .eq('utr_number', utr_number)
      .is('matched_pass_id', null)
      .single();

    const isAutoApproved = !!verification;
    const status = isAutoApproved ? 'approved' : 'pending';

    // 4. Create the pass
    const { data: passData, error: insertError } = await supabaseAdmin
      .from('passes')
      .insert({
        event_id,
        attendee_id: attendee_id || null,
        attendee_name,
        attendee_email,
        attendee_phone: attendee_phone || null,
        pass_number: passNumber,
        utr_number,
        status,
        qr_data: qrData,
      })
      .select()
      .single();

    if (insertError) {
      res.status(500).json({ error: insertError.message });
      return;
    }

    // 5. If auto-approved, link verification and send email
    if (isAutoApproved && passData) {
      await supabaseAdmin
        .from('payment_verifications')
        .update({ matched_pass_id: passData.id })
        .eq('id', verification.id);

      // Send pass email via internal call
      try {
        const backendPort = process.env.PORT || 4000;
        await fetch(`http://localhost:${backendPort}/api/send-pass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId: passData.id }),
        });
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    res.json({
      success: true,
      passId: passData?.id,
      passNumber: passData?.pass_number,
      status,
      autoApproved: isAutoApproved,
    });

  } catch (err: any) {
    console.error('Submit pass error:', err);
    res.status(500).json({ error: err.message });
  }
});
