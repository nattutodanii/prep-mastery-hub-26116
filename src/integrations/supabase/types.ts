export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_replies: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          id: string
          reply_message: string
          updated_at: string | null
          user_message_id: string | null
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          reply_message: string
          updated_at?: string | null
          user_message_id?: string | null
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          reply_message?: string
          updated_at?: string | null
          user_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_replies_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_replies_user_message_id_fkey"
            columns: ["user_message_id"]
            isOneToOne: false
            referencedRelation: "user_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarked_questions: {
        Row: {
          chapter_id: string | null
          course_id: string
          created_at: string
          id: string
          question_id: string
          test_id: string
          test_type: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          course_id: string
          created_at?: string
          id?: string
          question_id: string
          test_id: string
          test_type: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          course_id?: string
          created_at?: string
          id?: string
          question_id?: string
          test_id?: string
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      chapter_questions: {
        Row: {
          answer: string
          chapter_id: string
          correct_marks: number
          created_at: string
          id: string
          incorrect_marks: number
          is_pyq: boolean
          options: Json | null
          part: string | null
          partial_marks: number | null
          pyq_year: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks: number
          solution: string
          time_minutes: number
        }
        Insert: {
          answer: string
          chapter_id: string
          correct_marks?: number
          created_at?: string
          id?: string
          incorrect_marks?: number
          is_pyq?: boolean
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          pyq_year?: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution: string
          time_minutes?: number
        }
        Update: {
          answer?: string
          chapter_id?: string
          correct_marks?: number
          created_at?: string
          id?: string
          incorrect_marks?: number
          is_pyq?: boolean
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          pyq_year?: number | null
          question_statement?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution?: string
          time_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapter_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          short_notes: string | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          short_notes?: string | null
          unit_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          short_notes?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          coupon_code: string
          created_at: string
          current_uses: number | null
          discount_percentage: number
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_uses: number | null
          referrer_name: string | null
          referrer_user_id: string | null
          valid_until: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          current_uses?: number | null
          discount_percentage: number
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
          referrer_name?: string | null
          referrer_user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          current_uses?: number | null
          discount_percentage?: number
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
          referrer_name?: string | null
          referrer_user_id?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          admission_procedure: string | null
          alumni_stories: string | null
          average_package: string | null
          campus_life: string | null
          chapter_wise_questions: string | null
          course_comparison: string | null
          course_curriculum: string | null
          course_overview: string | null
          created_at: string | null
          day_in_life: string | null
          degree_type: string | null
          description: string | null
          duration: string | null
          entrance_exam_details: string | null
          exam_id: string | null
          exam_pattern: string | null
          freemium_group: string | null
          full_length_mocks: string | null
          global_exposure: string | null
          id: string
          intake_capacity: string | null
          is_calculator: boolean | null
          is_parts: boolean | null
          name: string | null
          notes: string | null
          placement_statistics: string | null
          premium_group: string | null
          preparation_strategy: string | null
          projects_assignments: string | null
          quick_facts: string | null
          short_notes: string | null
          skills_learning_outcomes: string | null
          syllabus: string | null
          test_parts: Json | null
          time: number | null
          updated_at: string | null
        }
        Insert: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: string | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: string | null
          full_length_mocks?: string | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name?: string | null
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: string | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: Json | null
          time?: number | null
          updated_at?: string | null
        }
        Update: {
          admission_procedure?: string | null
          alumni_stories?: string | null
          average_package?: string | null
          campus_life?: string | null
          chapter_wise_questions?: string | null
          course_comparison?: string | null
          course_curriculum?: string | null
          course_overview?: string | null
          created_at?: string | null
          day_in_life?: string | null
          degree_type?: string | null
          description?: string | null
          duration?: string | null
          entrance_exam_details?: string | null
          exam_id?: string | null
          exam_pattern?: string | null
          freemium_group?: string | null
          full_length_mocks?: string | null
          global_exposure?: string | null
          id?: string
          intake_capacity?: string | null
          is_calculator?: boolean | null
          is_parts?: boolean | null
          name?: string | null
          notes?: string | null
          placement_statistics?: string | null
          premium_group?: string | null
          preparation_strategy?: string | null
          projects_assignments?: string | null
          quick_facts?: string | null
          short_notes?: string | null
          skills_learning_outcomes?: string | null
          syllabus?: string | null
          test_parts?: Json | null
          time?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_roadmap: {
        Row: {
          course_id: string
          created_at: string
          current_day_index: number | null
          daily_schedule: Json | null
          exam_date: string | null
          id: string
          is_active: boolean | null
          mock_days: Json | null
          mock_days_count: number | null
          roadmap_data: Json | null
          study_approach: string | null
          study_days: Json | null
          subject_order: Json | null
          syllabus_progress: number | null
          theory_days: number | null
          total_days: number | null
          updated_at: string
          user_id: string
          weekly_hours: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          current_day_index?: number | null
          daily_schedule?: Json | null
          exam_date?: string | null
          id?: string
          is_active?: boolean | null
          mock_days?: Json | null
          mock_days_count?: number | null
          roadmap_data?: Json | null
          study_approach?: string | null
          study_days?: Json | null
          subject_order?: Json | null
          syllabus_progress?: number | null
          theory_days?: number | null
          total_days?: number | null
          updated_at?: string
          user_id: string
          weekly_hours?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          current_day_index?: number | null
          daily_schedule?: Json | null
          exam_date?: string | null
          id?: string
          is_active?: boolean | null
          mock_days?: Json | null
          mock_days_count?: number | null
          roadmap_data?: Json | null
          study_approach?: string | null
          study_days?: Json | null
          subject_order?: Json | null
          syllabus_progress?: number | null
          theory_days?: number | null
          total_days?: number | null
          updated_at?: string
          user_id?: string
          weekly_hours?: number | null
        }
        Relationships: []
      }
      exams: {
        Row: {
          admission_procedure: string | null
          campus: string | null
          campuses: Json | null
          created_at: string
          cutoff_trends: string | null
          description: string | null
          detailed_description: string | null
          eligibility_criteria: string | null
          established_year: number | null
          exam_centers: string | null
          exam_pattern: string | null
          faqs: Json | null
          fees_scholarships: string | null
          global_collaborations: string | null
          history: string | null
          id: string
          important_dates: string | null
          infrastructure: string | null
          introduction: string | null
          location: string | null
          name: string
          placements: string | null
          preparation_tips: string | null
          pyqs: string | null
          rankings: string | null
          recognition: string | null
          recommended_books: string | null
          scholarships_stipends: string | null
          short_description: string | null
          short_notes: string | null
          syllabus: string | null
          updated_at: string | null
          why_choose: string | null
        }
        Insert: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: Json | null
          created_at?: string
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: number | null
          exam_centers?: string | null
          exam_pattern?: string | null
          faqs?: Json | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          updated_at?: string | null
          why_choose?: string | null
        }
        Update: {
          admission_procedure?: string | null
          campus?: string | null
          campuses?: Json | null
          created_at?: string
          cutoff_trends?: string | null
          description?: string | null
          detailed_description?: string | null
          eligibility_criteria?: string | null
          established_year?: number | null
          exam_centers?: string | null
          exam_pattern?: string | null
          faqs?: Json | null
          fees_scholarships?: string | null
          global_collaborations?: string | null
          history?: string | null
          id?: string
          important_dates?: string | null
          infrastructure?: string | null
          introduction?: string | null
          location?: string | null
          name?: string
          placements?: string | null
          preparation_tips?: string | null
          pyqs?: string | null
          rankings?: string | null
          recognition?: string | null
          recommended_books?: string | null
          scholarships_stipends?: string | null
          short_description?: string | null
          short_notes?: string | null
          syllabus?: string | null
          updated_at?: string | null
          why_choose?: string | null
        }
        Relationships: []
      }
      gosuper: {
        Row: {
          created_at: string
          current_price: number
          discount_percentage: number
          expiry_date: string | null
          features: Json
          id: string
          original_price: number
          plan_name: string
          popular: boolean | null
          refer_earn_link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price: number
          discount_percentage: number
          expiry_date?: string | null
          features: Json
          id?: string
          original_price: number
          plan_name: string
          popular?: boolean | null
          refer_earn_link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          discount_percentage?: number
          expiry_date?: string | null
          features?: Json
          id?: string
          original_price?: number
          plan_name?: string
          popular?: boolean | null
          refer_earn_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mock_questions: {
        Row: {
          answer: string
          correct_marks: number
          course_id: string
          created_at: string
          id: string
          incorrect_marks: number
          mock_name: string
          options: Json | null
          part: string | null
          partial_marks: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks: number
          solution: string
          time_minutes: number
        }
        Insert: {
          answer: string
          correct_marks?: number
          course_id: string
          created_at?: string
          id?: string
          incorrect_marks?: number
          mock_name: string
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution: string
          time_minutes: number
        }
        Update: {
          answer?: string
          correct_marks?: number
          course_id?: string
          created_at?: string
          id?: string
          incorrect_marks?: number
          mock_name?: string
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          question_statement?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution?: string
          time_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "mock_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_student: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          message: string
          notification_type: string
          target_course_id: string | null
          target_exam_id: string | null
          target_user_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          message: string
          notification_type?: string
          target_course_id?: string | null
          target_exam_id?: string | null
          target_user_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          message?: string
          notification_type?: string
          target_course_id?: string | null
          target_exam_id?: string | null
          target_user_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_student_target_course_id_fkey"
            columns: ["target_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_student_target_exam_id_fkey"
            columns: ["target_exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_content: {
        Row: {
          created_at: string
          description: string
          early_bird_description: string
          early_bird_offer_active: boolean
          early_bird_title: string
          early_bird_users_claimed: number
          early_bird_users_limit: number
          id: string
          is_active: boolean
          main_headline: string
          stats_entrance_exams: string
          stats_entrance_exams_label: string
          stats_master_programs: string
          stats_master_programs_label: string
          stats_students: string
          stats_students_label: string
          stats_success_rate: string
          stats_success_rate_label: string
          top_badge: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          early_bird_description?: string
          early_bird_offer_active?: boolean
          early_bird_title?: string
          early_bird_users_claimed?: number
          early_bird_users_limit?: number
          id?: string
          is_active?: boolean
          main_headline?: string
          stats_entrance_exams?: string
          stats_entrance_exams_label?: string
          stats_master_programs?: string
          stats_master_programs_label?: string
          stats_students?: string
          stats_students_label?: string
          stats_success_rate?: string
          stats_success_rate_label?: string
          top_badge?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          early_bird_description?: string
          early_bird_offer_active?: boolean
          early_bird_title?: string
          early_bird_users_claimed?: number
          early_bird_users_limit?: number
          id?: string
          is_active?: boolean
          main_headline?: string
          stats_entrance_exams?: string
          stats_entrance_exams_label?: string
          stats_master_programs?: string
          stats_master_programs_label?: string
          stats_students?: string
          stats_students_label?: string
          stats_success_rate?: string
          stats_success_rate_label?: string
          top_badge?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          branch_address: string | null
          completed_at: string | null
          coupon_code: string
          coupon_purchased: string | null
          created_at: string
          currency: string
          id: string
          ifsc_code: string | null
          is_referral_purchase: boolean | null
          mobile_number: string | null
          payment_method: string
          payment_status: string
          plan_duration_months: number
          plan_name: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          branch_address?: string | null
          completed_at?: string | null
          coupon_code: string
          coupon_purchased?: string | null
          created_at?: string
          currency?: string
          id?: string
          ifsc_code?: string | null
          is_referral_purchase?: boolean | null
          mobile_number?: string | null
          payment_method: string
          payment_status?: string
          plan_duration_months: number
          plan_name?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          branch_address?: string | null
          completed_at?: string | null
          coupon_code?: string
          coupon_purchased?: string | null
          created_at?: string
          currency?: string
          id?: string
          ifsc_code?: string | null
          is_referral_purchase?: boolean | null
          mobile_number?: string | null
          payment_method?: string
          payment_status?: string
          plan_duration_months?: number
          plan_name?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          selected_course_id: string | null
          selected_exam_id: string | null
          subscription: Database["public"]["Enums"]["subscription_type"]
          subscription_expiry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          selected_course_id?: string | null
          selected_exam_id?: string | null
          subscription?: Database["public"]["Enums"]["subscription_type"]
          subscription_expiry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          selected_course_id?: string | null
          selected_exam_id?: string | null
          subscription?: Database["public"]["Enums"]["subscription_type"]
          subscription_expiry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          account_number: string | null
          bank_name: string | null
          branch_address: string | null
          coupon_code: string
          created_at: string
          earning_amount: number | null
          id: string
          ifsc_code: string | null
          mobile_number: string | null
          paid_at: string | null
          payment_method: string
          payout_status: string | null
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          branch_address?: string | null
          coupon_code: string
          created_at?: string
          earning_amount?: number | null
          id?: string
          ifsc_code?: string | null
          mobile_number?: string | null
          paid_at?: string | null
          payment_method: string
          payout_status?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          branch_address?: string | null
          coupon_code?: string
          created_at?: string
          earning_amount?: number | null
          id?: string
          ifsc_code?: string | null
          mobile_number?: string | null
          paid_at?: string | null
          payment_method?: string
          payout_status?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_query: {
        Row: {
          created_at: string
          id: string
          message: string
          responded_at: string | null
          response: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
          order_index: number | null
          parts: string | null
          slots: string | null
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
          order_index?: number | null
          parts?: string | null
          slots?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      test_analytics: {
        Row: {
          accuracy: number
          attempt_speed: number
          avg_time_per_question: number
          correct_answers: number
          course_id: string
          created_at: string
          difficulty_analysis: Json | null
          id: string
          incorrect_answers: number
          obtained_marks: number
          percentage: number
          percentile: number | null
          rank: number | null
          skipped_questions: number
          subject_wise_analysis: Json | null
          test_identifier: string
          test_name: string
          test_type: string
          time_taken_seconds: number
          total_marks: number
          total_questions: number
          updated_at: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          accuracy: number
          attempt_speed: number
          avg_time_per_question: number
          correct_answers: number
          course_id: string
          created_at?: string
          difficulty_analysis?: Json | null
          id?: string
          incorrect_answers: number
          obtained_marks: number
          percentage: number
          percentile?: number | null
          rank?: number | null
          skipped_questions: number
          subject_wise_analysis?: Json | null
          test_identifier: string
          test_name: string
          test_type: string
          time_taken_seconds: number
          total_marks: number
          total_questions: number
          updated_at?: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          accuracy?: number
          attempt_speed?: number
          avg_time_per_question?: number
          correct_answers?: number
          course_id?: string
          created_at?: string
          difficulty_analysis?: Json | null
          id?: string
          incorrect_answers?: number
          obtained_marks?: number
          percentage?: number
          percentile?: number | null
          rank?: number | null
          skipped_questions?: number
          subject_wise_analysis?: Json | null
          test_identifier?: string
          test_name?: string
          test_type?: string
          time_taken_seconds?: number
          total_marks?: number
          total_questions?: number
          updated_at?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          answers_state: Json | null
          attempt_count: number | null
          best_score: number | null
          chapter_id: string | null
          course_id: string
          created_at: string
          current_question: number | null
          id: string
          last_attempt_date: string | null
          remaining_time: number | null
          status: string | null
          test_identifier: string
          test_name: string
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_state?: Json | null
          attempt_count?: number | null
          best_score?: number | null
          chapter_id?: string | null
          course_id: string
          created_at?: string
          current_question?: number | null
          id?: string
          last_attempt_date?: string | null
          remaining_time?: number | null
          status?: string | null
          test_identifier: string
          test_name: string
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_state?: Json | null
          attempt_count?: number | null
          best_score?: number | null
          chapter_id?: string | null
          course_id?: string
          created_at?: string
          current_question?: number | null
          id?: string
          last_attempt_date?: string | null
          remaining_time?: number | null
          status?: string | null
          test_identifier?: string
          test_name?: string
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_history: {
        Row: {
          answers: Json
          attempted_questions: number
          chapter_id: string | null
          completed: boolean
          correct_answers: number
          course_id: string
          created_at: string
          current_question: number | null
          id: string
          incorrect_answers: number
          mode: string
          obtained_marks: number
          remaining_time: number | null
          skipped_questions: number
          test_data: Json | null
          test_name: string
          test_progress: Json | null
          test_state: string | null
          test_type: string
          time_taken_minutes: number
          time_taken_seconds: number | null
          total_marks: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers: Json
          attempted_questions: number
          chapter_id?: string | null
          completed?: boolean
          correct_answers: number
          course_id: string
          created_at?: string
          current_question?: number | null
          id?: string
          incorrect_answers: number
          mode: string
          obtained_marks: number
          remaining_time?: number | null
          skipped_questions: number
          test_data?: Json | null
          test_name: string
          test_progress?: Json | null
          test_state?: string | null
          test_type: string
          time_taken_minutes: number
          time_taken_seconds?: number | null
          total_marks: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          attempted_questions?: number
          chapter_id?: string | null
          completed?: boolean
          correct_answers?: number
          course_id?: string
          created_at?: string
          current_question?: number | null
          id?: string
          incorrect_answers?: number
          mode?: string
          obtained_marks?: number
          remaining_time?: number | null
          skipped_questions?: number
          test_data?: Json | null
          test_name?: string
          test_progress?: Json | null
          test_state?: string | null
          test_type?: string
          time_taken_minutes?: number
          time_taken_seconds?: number | null
          total_marks?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_history_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_history_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      test_leaderboard: {
        Row: {
          chapter_id: string | null
          completed_at: string
          course_id: string
          created_at: string
          id: string
          name: string | null
          percentage: number
          score: number
          test_identifier: string
          test_name: string
          test_type: string
          time_taken_minutes: number
          time_taken_seconds: number | null
          total_marks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          completed_at?: string
          course_id: string
          created_at?: string
          id?: string
          name?: string | null
          percentage?: number
          score?: number
          test_identifier: string
          test_name: string
          test_type: string
          time_taken_minutes: number
          time_taken_seconds?: number | null
          total_marks: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          completed_at?: string
          course_id?: string
          created_at?: string
          id?: string
          name?: string | null
          percentage?: number
          score?: number
          test_identifier?: string
          test_name?: string
          test_type?: string
          time_taken_minutes?: number
          time_taken_seconds?: number | null
          total_marks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          answer: string
          correct_marks: number
          course_id: string
          created_at: string
          id: string
          incorrect_marks: number
          options: Json | null
          part: string | null
          partial_marks: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks: number
          solution: string
          test_name: string
          time_minutes: number
          unit_id: string | null
        }
        Insert: {
          answer: string
          correct_marks?: number
          course_id: string
          created_at?: string
          id?: string
          incorrect_marks?: number
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          question_statement: string
          question_type: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution: string
          test_name: string
          time_minutes?: number
          unit_id?: string | null
        }
        Update: {
          answer?: string
          correct_marks?: number
          course_id?: string
          created_at?: string
          id?: string
          incorrect_marks?: number
          options?: Json | null
          part?: string | null
          partial_marks?: number | null
          question_statement?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          skipped_marks?: number
          solution?: string
          test_name?: string
          time_minutes?: number
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          subject_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          subject_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_read: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_read_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_student"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          chapter_id: string
          chapter_practice_completed: boolean | null
          chapter_pyq_completed: boolean | null
          course_id: string
          created_at: string
          id: string
          last_accessed: string | null
          user_id: string
        }
        Insert: {
          chapter_id: string
          chapter_practice_completed?: boolean | null
          chapter_pyq_completed?: boolean | null
          course_id: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string
          chapter_practice_completed?: boolean | null
          chapter_pyq_completed?: boolean | null
          course_id?: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_freeze_used: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_freeze_used?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_freeze_used?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_expired_subscriptions: { Args: never; Returns: undefined }
      check_subscription_expiry: { Args: never; Returns: undefined }
      update_user_subscription: {
        Args: {
          p_duration_months: number
          p_payment_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      question_type: "MCQ" | "MSQ" | "NAT" | "SUB"
      subscription_type: "freemium" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      question_type: ["MCQ", "MSQ", "NAT", "SUB"],
      subscription_type: ["freemium", "premium"],
    },
  },
} as const
