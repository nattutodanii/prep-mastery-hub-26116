
-- Add Razorpay payment integration columns to payment_history table
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS razorpay_signature text,
ADD COLUMN IF NOT EXISTS plan_name text;

-- Create a function to update user subscription after successful payment
CREATE OR REPLACE FUNCTION update_user_subscription(
  p_user_id uuid,
  p_duration_months integer,
  p_payment_id text
) RETURNS void AS $$
DECLARE
  current_expiry timestamp with time zone;
  new_expiry timestamp with time zone;
BEGIN
  -- Get current subscription expiry
  SELECT subscription_expiry INTO current_expiry
  FROM profiles 
  WHERE user_id = p_user_id;
  
  -- Calculate new expiry date
  IF current_expiry IS NULL OR current_expiry < NOW() THEN
    -- If no expiry or expired, start from today
    new_expiry := NOW() + (p_duration_months || ' months')::interval;
  ELSE
    -- If still active, extend from current expiry
    new_expiry := current_expiry + (p_duration_months || ' months')::interval;
  END IF;
  
  -- Update user profile
  UPDATE profiles 
  SET 
    subscription = 'premium',
    subscription_expiry = new_expiry,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update payment history status
  UPDATE payment_history 
  SET 
    payment_status = 'completed',
    completed_at = NOW()
  WHERE razorpay_payment_id = p_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
