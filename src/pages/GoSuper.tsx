
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Crown, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenTestLayout } from "@/components/test/FullScreenTestLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function GoSuper() {
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
        name: 'Premium Subscription',
        description: `${selectedPlan.plan_name} Subscription`,
        order_id: orderData.orderId,
        // Server-side fallback verification even if app is backgrounded (mobile UPI, QR)
        callback_url: 'https://jvcaoionosquiimjffpm.supabase.co/functions/v1/verify-payment',
        redirect: true,
        handler: async function (response: any) {
          try {
            // Client-side verification (desktop/web) remains for instant UX
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
              description: "Your subscription has been activated successfully.",
            });

            // Reload the page to update user profile
            window.location.reload();
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

  if (loading) {
    return (
      <FullScreenTestLayout onExit={() => window.history.back()}>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </FullScreenTestLayout>
    );
  }

  return (
    <FullScreenTestLayout onExit={() => window.history.back()}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Crown className="h-16 w-16 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Go Super with Premium</h1>
            <p className="text-xl text-muted-foreground">Unlock unlimited access to all features</p>
            <Badge variant="destructive" className="mt-4">Early Bird Offer - Limited Time</Badge>
          </div>

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

          {selectedPlan && (
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Ready to Purchase
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
                    {paymentLoading ? "Processing..." : "Buy Now with Razorpay"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Comparison */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Freemium vs Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-4 text-muted-foreground">Freemium Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Access to first chapter of each subject</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Basic practice tests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Limited mock tests (1 test)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Basic analytics</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 text-primary">Premium Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Unlimited access to all chapters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>All practice and PYQ tests</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>All mock tests and test series</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Detailed analytics and insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Bookmark unlimited questions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Complete test history</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>All notes and short notes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Premium community access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Offers */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200">
            <CardHeader>
              <CardTitle>🎉 Special Offers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Early Bird Special - Limited Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">No Hidden Charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Money Back Guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FullScreenTestLayout>
  );
}
