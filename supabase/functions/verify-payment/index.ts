
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const razorpayWebhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')

    if (!razorpayKeySecret || !serviceRoleKey) {
      console.error('Missing required environment variables')
      throw new Error('Server configuration error')
    }

    const contentType = req.headers.get('content-type') || ''
    const webhookSignature = req.headers.get('x-razorpay-signature')
    
    let razorpayPaymentId = ''
    let razorpayOrderId = ''
    let razorpaySignature = ''
    let isWebhook = false

    // Handle Razorpay Webhook (X-Razorpay-Signature header present)
    if (webhookSignature && razorpayWebhookSecret) {
      console.log('Processing Razorpay webhook')
      isWebhook = true
      
      const rawBody = await req.text()
      const expectedWebhookSignature = createHmac('sha256', razorpayWebhookSecret)
        .update(rawBody)
        .digest('hex')

      if (expectedWebhookSignature !== webhookSignature) {
        console.error('Webhook signature mismatch')
        throw new Error('Invalid webhook signature')
      }

      const webhookBody = JSON.parse(rawBody)
      console.log('Webhook event:', webhookBody.event)

      // Extract payment details from webhook payload
      if (webhookBody.event === 'payment.captured' || webhookBody.event === 'order.paid') {
        const payment = webhookBody.payload?.payment?.entity || webhookBody.payload?.order?.entity
        razorpayPaymentId = payment?.id || ''
        razorpayOrderId = payment?.order_id || ''
      } else {
        console.log('Ignoring webhook event:', webhookBody.event)
        return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
    }
    // Handle callback/redirect (POST form-encoded or JSON, or GET query params)
    else if (req.method === 'POST' && contentType.includes('application/json')) {
      console.log('Processing JSON callback')
      const body = await req.json()
      razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id || ''
      razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id || ''
      razorpaySignature = body.razorpaySignature || body.razorpay_signature || ''
    } else if (req.method === 'POST') {
      console.log('Processing form-encoded callback')
      const text = await req.text()
      const params = new URLSearchParams(text)
      razorpayPaymentId = params.get('razorpay_payment_id') || ''
      razorpayOrderId = params.get('razorpay_order_id') || ''
      razorpaySignature = params.get('razorpay_signature') || ''
    } else {
      console.log('Processing GET redirect')
      const url = new URL(req.url)
      razorpayPaymentId = url.searchParams.get('razorpay_payment_id') || ''
      razorpayOrderId = url.searchParams.get('razorpay_order_id') || ''
      razorpaySignature = url.searchParams.get('razorpay_signature') || ''
    }

    if (!razorpayPaymentId || !razorpayOrderId) {
      throw new Error('Missing Razorpay parameters')
    }

    console.log('Verifying payment. Order:', razorpayOrderId, 'Payment:', razorpayPaymentId)

    // Verify signature for callback/redirect (not for webhook, already verified above)
    if (!isWebhook) {
      if (!razorpaySignature) {
        throw new Error('Missing razorpay_signature')
      }
      
      const body = razorpayOrderId + '|' + razorpayPaymentId
      const expectedSignature = createHmac('sha256', razorpayKeySecret)
        .update(body.toString())
        .digest('hex')

      if (expectedSignature !== razorpaySignature) {
        console.error('Signature mismatch. Expected:', expectedSignature, 'Got:', razorpaySignature)
        throw new Error('Invalid signature')
      }
    }

    console.log('Signature verified successfully')

    // Use service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
    )

    // Get payment record by order id
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle()

    if (paymentError || !paymentRecord) {
      console.error('Payment record not found for order:', razorpayOrderId, paymentError)
      throw new Error('Payment record not found')
    }

    // Idempotency: if already completed, just return success
    if (paymentRecord.payment_status === 'completed') {
      console.log('Payment already completed for order:', razorpayOrderId)
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // Update payment record with payment details
    const { error: updateError } = await supabaseAdmin
      .from('payment_history')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpayOrderId)

    if (updateError) {
      console.error('Failed to update payment record:', updateError)
      throw new Error('Failed to update payment record')
    }

    console.log('Payment record updated successfully')

    // Update user subscription using the database function
    const { error: rpcError } = await supabaseAdmin.rpc('update_user_subscription', {
      p_user_id: paymentRecord.user_id,
      p_duration_months: paymentRecord.plan_duration_months,
      p_payment_id: razorpayPaymentId,
    })

    if (rpcError) {
      console.error('Failed to update subscription:', rpcError)
      throw new Error('Failed to update subscription: ' + rpcError.message)
    }

    console.log('Subscription updated successfully for user:', paymentRecord.user_id)

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified and subscription updated' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in verify-payment:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
