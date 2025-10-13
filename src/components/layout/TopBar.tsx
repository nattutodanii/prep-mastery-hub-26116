import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Flame, User, Settings, BookmarkCheck, CreditCard, LogOut, RotateCcw, BarChart3 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useStreak } from "@/hooks/useStreak";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookmarkedQuestions } from "@/components/profile/BookmarkedQuestions";
import { TestHistory } from "@/components/profile/TestHistory";
import { ChangeExam } from "@/components/profile/ChangeExam";
import { ExtendSubscription } from "@/components/profile/ExtendSubscription";
import { NotificationPopup } from "@/components/notifications/NotificationPopup";
import { StreakPopup } from "@/components/streaks/StreakPopup";

interface TopBarProps {
  userName: string;
}

type ProfileView = 'main' | 'bookmarks' | 'history' | 'change-exam' | 'about' | 'extend-subscription';

export function TopBar({ userName }: TopBarProps) {
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const { unreadCount, markAllAsRead } = useNotifications();
  const { streak } = useStreak();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Refresh the page to redirect to onboarding
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
  };

  const handleStreakClick = () => {
    setShowStreak(true);
  };

  const handleNotificationRead = () => {
    markAllAsRead();
  };

  const handleChangeExam = () => {
    setCurrentView('change-exam');
  };

  const handleBookmarkedQuestions = () => {
    setCurrentView('bookmarks');
  };

  const handleTestHistory = () => {
    setCurrentView('history');
  };

  const handleExtendSubscription = () => {
    setCurrentView('extend-subscription');
  };

  const handleAbout = () => {
    setCurrentView('about');
  };

  const handleBackToMain = () => {
    setCurrentView('main');
  };

  // Render profile views
  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <BookmarkedQuestions onClose={handleBackToMain} />
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <TestHistory onClose={handleBackToMain} />
      </div>
    );
  }

  if (currentView === 'change-exam') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <ChangeExam onClose={handleBackToMain} />
      </div>
    );
  }

  if (currentView === 'extend-subscription') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <ExtendSubscription onClose={handleBackToMain} />
      </div>
    );
  }

  if (currentView === 'about') {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">About & Settings</h2>
              <p className="text-muted-foreground">Account information and application details</p>
            </div>
            <Button variant="outline" onClick={handleBackToMain}>
              Back to Dashboard
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription:</span>
                  <Badge variant={profile?.subscription === 'premium' ? 'default' : 'outline'}>
                    {profile?.subscription === 'premium' ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                {profile?.subscription === 'premium' && profile?.subscription_expiry && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium">
                      {new Date(profile.subscription_expiry).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* App Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="font-medium">January 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal & Support</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                Terms of Service
              </Button>
              <Button variant="outline" className="justify-start">
                Privacy Policy
              </Button>
              <Button variant="outline" className="justify-start">
                Contact Support
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b bg-white h-16 flex items-center justify-between px-6">
        {/* Left side - Brand */}
        <div className="flex-1 flex items-center">
          <div className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            MastersUp
          </div>
        </div>

        {/* Right side - Notifications, Streak, Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Streak */}
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200"
            onClick={handleStreakClick}
          >
            <Flame className="h-4 w-4" />
            <span>{streak?.current_streak || 0} day streak</span>
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile?.subscription === 'premium' ? 'Premium Member' : 'Free Member'}
                </p>
                {profile?.subscription === 'premium' && profile?.subscription_expiry && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Expires: {new Date(profile.subscription_expiry).toLocaleDateString()}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleAbout}>
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleChangeExam}>
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Change Exam</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTestHistory}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Test History</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBookmarkedQuestions}>
                <BookmarkCheck className="mr-2 h-4 w-4" />
                <span>Bookmarked Questions</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExtendSubscription}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{profile?.subscription === 'premium' ? 'Extend Subscription' : 'Go Super'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Popups */}
      {showNotifications && (
        <NotificationPopup 
          onClose={() => setShowNotifications(false)} 
          onNotificationRead={handleNotificationRead}
        />
      )}
      
      {showStreak && (
        <StreakPopup onClose={() => setShowStreak(false)} />
      )}
    </>
  );
}
