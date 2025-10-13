
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Crown, X, Calendar, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface ExtendSubscriptionProps {
  onClose: () => void;
}

export function ExtendSubscription({ onClose }: ExtendSubscriptionProps) {
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    fetchPlansAndCoupons();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchPlansAndCoupons = async () => {
    try {
      const [plansResponse, couponsResponse] = await Promise.all([
        supabase.from('gosuper').select('*').order('current_price'),
        supabase.from('coupons').select('*').eq('is_active', true).eq('is_public', true)
      ]);

      if (plansResponse.data) setSubscriptionPlans(plansResponse.data);
      if (couponsResponse.data) setCoupons(couponsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    const coupon = coupons.find(c => c.coupon_code.toLowerCase() === couponCode.toLowerCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      toast({
        title: "Coupon Applied!",
        description: `${coupon.discount_percentage}% discount applied successfully.`,
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid.",
        variant: "destructive"
      });
    }
  };

  const calculateDiscountedPrice = (originalPrice: number, planDiscount: number) => {
    let finalPrice = originalPrice * (1 - planDiscount / 100);
    if (appliedCoupon) {
      finalPrice = finalPrice * (1 - appliedCoupon.discount_percentage / 100);
    }
    return finalPrice;
  };

  const getPlanDurationInMonths = (planName: string) => {
    if (planName.toLowerCase().includes('1 month') || planName.toLowerCase().includes('monthly')) return 1;
    if (planName.toLowerCase().includes('3 month') || planName.toLowerCase().includes('quarterly')) return 3;
    if (planName.toLowerCase().includes('6 month') || planName.toLowerCase().includes('half yearly')) return 6;
    if (planName.toLowerCase().includes('12 month') || planName.toLowerCase().includes('yearly') || planName.toLowerCase().includes('annual')) return 12;
    return 1; // default
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user) {
      toast({
        title: "Error",
        description: "Please select a plan and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    setPaymentLoading(true);

    try {
      const finalAmount = calculateDiscountedPrice(selectedPlan.current_price, selectedPlan.discount_percentage);
      const durationMonths = getPlanDurationInMonths(selectedPlan.plan_name);

      // Create Razorpay order
      const { data: orderData, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: finalAmount,
          currency: 'INR',
          planName: selectedPlan.plan_name,
          planDurationMonths: durationMonths,
          couponCode: appliedCoupon?.coupon_code || ''
        }
      });

      if (error) throw error;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Extend Premium Subscription',
        description: `Extend ${selectedPlan.plan_name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }
            });

            if (verifyError) throw verifyError;

            toast({
              title: "Payment Successful!",
              description: "Your subscription has been extended successfully.",
            });

            // Go back to profile
            onClose();
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#8B5CF6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Extend Subscription</h2>
            <p className="text-muted-foreground">Extend your premium subscription</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Extend Subscription</h2>
          <p className="text-muted-foreground">Extend your premium subscription</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Current Subscription Status */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Current Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Subscription Type:</span>
            <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg">Expires On:</span>
            <span className="text-lg font-bold text-purple-600">
              {profile?.subscription_expiry ? formatExpiryDate(profile.subscription_expiry) : 'No expiry date'}
            </span>
          </div>
          {profile?.subscription_expiry && (
            <div className="text-sm text-muted-foreground">
              Your subscription will be extended from the current expiry date
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans Selection */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        {subscriptionPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative cursor-pointer transition-all duration-200 ${
              selectedPlan?.id === plan.id 
                ? 'border-primary shadow-lg scale-105' 
                : plan.popular 
                  ? 'border-primary shadow-lg' 
                  : 'hover:scale-102 hover:shadow-md'
            }`}
            onClick={() => handlePlanSelect(plan)}
          >
            {plan.popular && <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">Most Popular</Badge>}
            {selectedPlan?.id === plan.id && (
              <Badge className="absolute -top-3 right-4 bg-green-500">Selected</Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle>{plan.plan_name}</CardTitle>
              <div className="text-3xl font-bold text-primary">
                ₹{calculateDiscountedPrice(plan.current_price, plan.discount_percentage).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground line-through">₹{plan.original_price}</div>
              <Badge variant="secondary">{plan.discount_percentage}% OFF</Badge>
              {appliedCoupon && (
                <Badge variant="outline" className="mt-2">
                  Additional {appliedCoupon.discount_percentage}% OFF Applied!
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coupon Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Apply Coupon Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Enter coupon code" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button variant="outline" onClick={applyCoupon}>Apply</Button>
          </div>
          
          {appliedCoupon && (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Coupon "{appliedCoupon.coupon_code}" applied! {appliedCoupon.discount_percentage}% additional discount</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAppliedCoupon(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-medium">Available Public Coupons:</h4>
            <div className="flex flex-wrap gap-2">
              {coupons.filter(c => c.is_public).map((coupon) => (
                <Badge 
                  key={coupon.id} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setCouponCode(coupon.coupon_code)}
                >
                  {coupon.coupon_code} ({coupon.discount_percentage}% OFF)
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      {selectedPlan && (
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Ready to Extend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Selected Plan:</span>
                <span className="text-lg font-bold">{selectedPlan.plan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Final Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{calculateDiscountedPrice(selectedPlan.current_price, selectedPlan.discount_percentage).toFixed(0)}
                </span>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg"
                onClick={handlePayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Processing..." : "Extend Subscription with Razorpay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
