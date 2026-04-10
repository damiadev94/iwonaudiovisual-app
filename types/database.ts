export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  genres: string[];
  instagram_url: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  role: "user" | "admin" | "moderator";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  mp_subscription_id: string | null;
  mp_preapproval_id: string | null;
  status: "pending" | "active" | "paused" | "cancelled" | "expired";
  plan_amount: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  mp_payment_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  payment_method: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: "finanzas" | "marketing" | "branding" | "distribucion" | "legal" | "estrategia";
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_public_id: string | null;
  duration_minutes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
};

export type LessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_seconds: number;
  completed_at: string | null;
};

export type Selection = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "open" | "reviewing" | "announced" | "in_production" | "completed";
  open_date: string | null;
  close_date: string | null;
  announcement_date: string | null;
  max_selected: number;
  created_at: string;
};

export type SelectionApplication = {
  id: string;
  selection_id: string;
  user_id: string;
  demo_url: string;
  demo_description: string | null;
  tracks_count: number;
  status: "pending" | "reviewing" | "selected" | "rejected";
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Raffle = {
  id: string;
  title: string;
  description: string | null;
  prize_description: string;
  status: "draft" | "active" | "completed" | "cancelled";
  draw_date: string | null;
  winner_id: string | null;
  created_at: string;
};

export type RaffleEntry = {
  id: string;
  raffle_id: string;
  user_id: string;
  created_at: string;
};

export type Promo = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  max_slots: number;
  slots_taken: number;
  status: "draft" | "active" | "sold_out" | "completed";
  available_from: string | null;
  available_until: string | null;
  created_at: string;
};

export type PromoBooking = {
  id: string;
  promo_id: string;
  user_id: string;
  mp_payment_id: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
};
