export type MPWebhookEvent = {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
};

export type MPPreapproval = {
  id: string;
  payer_id: number;
  payer_email: string;
  back_url: string;
  init_point: string;
  status: string;
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  };
  date_created: string;
};

export type MPPayment = {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payer: {
    email: string;
    id: string;
  };
  date_created: string;
};
