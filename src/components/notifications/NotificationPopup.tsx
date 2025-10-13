
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Info, Send, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  target_exam_id?: string;
  target_course_id?: string;
  target_user_id?: string;
}

interface StudentQuery {
  id: string;
  message: string;
  response?: string;
  status: string;
  created_at: string;
  responded_at?: string;
}

interface NotificationPopupProps {
  onClose: () => void;
  onNotificationRead: () => void;
}

export function NotificationPopup({ onClose, onNotificationRead }: NotificationPopupProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [studentQueries, setStudentQueries] = useState<StudentQuery[]>([]);
  const [queryMessage, setQueryMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchStudentQueries();
    markNotificationsAsRead();
  }, [user?.id, profile?.selected_exam_id, profile?.selected_course_id]);

  const fetchNotifications = async () => {
    try {
      let query = supabase
        .from('notification_student')
        .select('*')
        .eq('is_active', true);

      // Get notifications for this user based on targeting
      const { data, error } = await query
        .or(`notification_type.eq.general,target_exam_id.eq.${profile?.selected_exam_id},target_course_id.eq.${profile?.selected_course_id},target_user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStudentQueries = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('student_query')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudentQueries(data || []);
    } catch (error) {
      console.error('Error fetching student queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user?.id || notifications.length === 0) return;

    try {
      // Mark all current notifications as read
      const readPromises = notifications.map(notification =>
        supabase
          .from('user_notification_read')
          .upsert({
            user_id: user.id,
            notification_id: notification.id
          })
      );

      await Promise.all(readPromises);
      onNotificationRead();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleSubmitQuery = async () => {
    if (!queryMessage.trim() || !user?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('student_query')
        .insert({
          user_id: user.id,
          message: queryMessage.trim()
        });

      if (error) throw error;

      toast({
        title: "Query Submitted",
        description: "Our team will assist you within the next 24 hours. Please wait and avoid sending inappropriate messages.",
      });

      setQueryMessage("");
      fetchStudentQueries();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'exam':
        return 'bg-green-100 text-green-800';
      case 'course':
        return 'bg-purple-100 text-purple-800';
      case 'individual':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading notifications...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getNotificationTypeColor(notification.notification_type)}`}>
                          {notification.notification_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No notifications available
                </div>
              )}

              {studentQueries.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h4 className="font-medium text-sm mb-3">Your Queries</h4>
                  {studentQueries.map((query) => (
                    <div key={query.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={query.status === 'responded' ? 'default' : 'secondary'}>
                          {query.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(query.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        <strong>Your Query:</strong> {query.message}
                      </p>
                      {query.response && (
                        <div className="bg-white p-2 rounded border-l-2 border-green-500">
                          <p className="text-sm">
                            <strong>Response:</strong> {query.response}
                          </p>
                          {query.responded_at && (
                            <span className="text-xs text-muted-foreground">
                              Responded: {formatDate(query.responded_at)}
                            </span>
                          )}
                        </div>
                      )}
                      {query.status === 'pending' && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                          <Clock className="h-3 w-3" />
                          Awaiting response within 24 hours
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>

          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm">Send a Query</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Please send your query within limits. We will answer within the next 24 hours. 
                      Sending inappropriate or offensive messages could result in permanent account deletion.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your query here..."
                value={queryMessage}
                onChange={(e) => setQueryMessage(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {queryMessage.length}/500 characters
              </span>
              <Button 
                onClick={handleSubmitQuery} 
                disabled={!queryMessage.trim() || submitting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Query'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
