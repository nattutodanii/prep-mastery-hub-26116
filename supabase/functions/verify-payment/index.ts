
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json()
    
    // Create client with auth header to get the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Authentication failed')
    }
    
    console.log('Verifying payment for user:', user.id, 'Payment ID:', razorpayPaymentId)
    // Verify signature (LIVE credentials)
    const razorpayKeySecret = 'E2i4sk026wt7Tjp6lVzNlLlr'
    const body = razorpayOrderId + "|" + razorpayPaymentId
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      console.error('Signature mismatch. Expected:', expectedSignature, 'Got:', razorpaySignature)
      throw new Error('Invalid signature')
    }

    console.log('Signature verified successfully')

    // Use service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get payment record
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('razorpay_order_id', razorpayOrderId)
      .single()

    if (paymentError || !paymentRecord) {
      console.error('Payment record not found:', paymentError)
      throw new Error('Payment record not found')
    }

    console.log('Payment record found:', paymentRecord.id, 'Duration:', paymentRecord.plan_duration_months, 'months')

    // Update payment record with payment details
    const { error: updateError } = await supabaseAdmin
      .from('payment_history')
      .update({
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', razorpayOrderId)

    if (updateError) {
      console.error('Failed to update payment record:', updateError)
      throw new Error('Failed to update payment record')
    }

    console.log('Payment record updated successfully')

    // Update user subscription using the database function
    const { error: rpcError } = await supabaseAdmin.rpc('update_user_subscription', {
      p_user_id: user.id,
      p_duration_months: paymentRecord.plan_duration_months,
      p_payment_id: razorpayPaymentId
    })

    if (rpcError) {
      console.error('Failed to update subscription:', rpcError)
      throw new Error('Failed to update subscription: ' + rpcError.message)
    }

    console.log('Subscription updated successfully for user:', user.id)

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
