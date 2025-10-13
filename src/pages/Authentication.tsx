import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthenticationProps {
  onBack: () => void;
  onAuthenticated: () => void;
}

export function Authentication({ onBack, onAuthenticated }: AuthenticationProps) {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Authentication Error", 
        description: "Failed to authenticate with Google",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async () => {
    if (phoneNumber.length === 10) {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
          phone: `${countryCode}${phoneNumber}`,
        });
        
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setShowOtp(true);
          toast({
            title: "OTP Sent",
            description: "Please check your phone for the verification code",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send OTP",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOtpVerification = async () => {
    if (otp.length === 6) {
      try {
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
          phone: `${countryCode}${phoneNumber}`,
          token: otp,
          type: 'sms'
        });
        
        if (error) {
          toast({
            title: "Verification Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          onAuthenticated();
        }
      } catch (error) {
        toast({
          title: "Verification Error",
          description: "Failed to verify OTP",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Motivational Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-purple-600 p-12 flex-col justify-center text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">
            Your Success Journey Starts Here
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have cracked their dream exams with Masters Up.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>85% average improvement in scores</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>10,000+ practice questions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Detailed performance analytics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Expert-crafted study materials</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Logo />
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to Masters Up</CardTitle>
              <CardDescription>
                Choose your preferred method to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as 'google' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="google">
                    <Mail className="h-4 w-4 mr-2" />
                    Google
                  </TabsTrigger>
                  <TabsTrigger value="phone">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="google" className="space-y-4">
                  <Button 
                    className="w-full" 
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    {loading ? "Authenticating..." : "Continue with Google"}
                  </Button>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  {!showOtp ? (
                    <>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="flex gap-2">
                          <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+91">+91</SelectItem>
                              <SelectItem value="+1">+1</SelectItem>
                              <SelectItem value="+44">+44</SelectItem>
                              <SelectItem value="+86">+86</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            maxLength={10}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handlePhoneAuth}
                        disabled={phoneNumber.length !== 10}
                      >
                        Send OTP
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                        <p className="text-sm text-muted-foreground">
                          OTP sent to {countryCode} {phoneNumber}
                        </p>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleOtpVerification}
                        disabled={otp.length !== 6}
                      >
                        Verify OTP
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => setShowOtp(false)}
                      >
                        Change Phone Number
                      </Button>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              <div className="text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}