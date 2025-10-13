
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useNotifications() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id, profile?.selected_exam_id, profile?.selected_course_id]);

  const fetchUnreadCount = async () => {
    try {
      // Get all active notifications for this user
      let notificationQuery = supabase
        .from('notification_student')
        .select('id')
        .eq('is_active', true);

      // Filter by user targeting
      const { data: notifications, error: notificationError } = await notificationQuery
        .or(`notification_type.eq.general,target_exam_id.eq.${profile?.selected_exam_id},target_course_id.eq.${profile?.selected_course_id},target_user_id.eq.${user?.id}`);

      if (notificationError) throw notificationError;

      if (notifications && notifications.length > 0) {
        // Get read notifications for this user
        const { data: readNotifications, error: readError } = await supabase
          .from('user_notification_read')
          .select('notification_id')
          .eq('user_id', user?.id)
          .in('notification_id', notifications.map(n => n.id));

        if (readError) throw readError;

        const readNotificationIds = new Set(readNotifications?.map(r => r.notification_id) || []);
        const unreadNotifications = notifications.filter(n => !readNotificationIds.has(n.id));
        
        setUnreadCount(unreadNotifications.length);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  return { unreadCount, loading, fetchUnreadCount, markAllAsRead };
}
