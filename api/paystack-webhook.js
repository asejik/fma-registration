import crypto from 'crypto';

export default async function handler(req, res) {
  // Paystack sends a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the event is from Paystack
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  if (!signature) {
    return res.status(401).json({ message: 'No signature provided' });
  }

  // If secret is set in environment, verify the signature for security
  if (secret) {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      console.error('Webhook: Invalid signature');
      return res.status(401).json({ message: 'Invalid signature' });
    }
  } else {
    console.warn('Webhook: PAYSTACK_SECRET_KEY not set. Signature verification skipped.');
  }

  const event = req.body;

  // We only care about successful charges
  if (event.event === 'charge.success') {
    const data = event.data;
    const metadata = data.metadata;
    const reference = data.reference;

    // SECURITY: Only process payments belonging to the FMA subaccount
    // This ensures other church payments on the same Paystack account are ignored
    const FMA_SUBACCOUNT = "ACCT_cpxpivjkswnoekf";
    const paymentSubaccount = data.subaccount?.subaccount_code || data.subaccount;
    
    if (paymentSubaccount !== FMA_SUBACCOUNT) {
        console.log(`Webhook: Ignoring payment for subaccount ${paymentSubaccount}`);
        return res.status(200).json({ message: 'Ignored (Different Subaccount)' });
    }

    // Check if we have the metadata we need
    if (!metadata || !metadata.email) {
      console.error('Webhook: Received success but no student metadata found.');
      return res.status(200).json({ message: 'Success (but no metadata)' });
    }

    // Map the data to our internal registration format
    const registrationData = {
      ...metadata,
      paymentReference: reference,
      amountPaid: data.amount / 100,
      status: 'paid',
      currency: data.currency,
      paidAt: data.paid_at,
      dateString: new Date().toISOString()
    };

    try {
      const results = [];

      // 1. Forward to Google Apps Script (Spreadsheet + Email)
      const googleScriptUrl = process.env.VITE_REGISTRATION_SHEET_URL;
      if (googleScriptUrl) {
        const googleRes = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });
        results.push(`Google Script: ${googleRes.status}`);
      }

      // 2. Save to Firestore via REST API
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
      if (projectId) {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${reference}`;
        
        // Construct Firestore REST fields
        const fields = {};
        Object.keys(registrationData).forEach(key => {
            const val = registrationData[key];
            if (val !== undefined && val !== null) {
              fields[key] = { stringValue: String(val) };
            }
        });
        
        // Add timestamp as a string for simplicity in REST API
        fields['registeredAt_webhook'] = { stringValue: new Date().toISOString() };

        const firestoreRes = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
        });
        results.push(`Firestore: ${firestoreRes.status}`);
      }

      console.log(`Webhook: Successfully processed payment for ${metadata.email}`);
      return res.status(200).json({ message: 'Success', results });
    } catch (error) {
      console.error('Webhook: Processing error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // Acknowledge other events (like charge.failed) but take no action
  return res.status(200).json({ message: 'Event received' });
}
