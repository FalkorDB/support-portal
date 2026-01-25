// User and Authentication Types
export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  type: string; // 'end-user' or 'agent'
}

export interface AuthResponse {
  data: User;
  access_token?: string;
  requiresConfirmation?: boolean;
}

// Conversation/Ticket Types
export interface Conversation {
  id: number;
  status: 'new' | 'open' | 'pending' | 'solved' | 'closed' | 'resolved' | 'snoozed';
  created_at: string;
  updated_at: string;
  messages?: Message[];
  meta?: {
    sender?: Contact;
    assignee?: User;
  };
  last_non_activity_message?: {
    content: string;
  };
}

// Contact Types
export interface Contact {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  custom_attributes?: {
    [key: string]: any;
  };
}

// Message Types
export interface Message {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing' | 'activity' | 'template' | number | string;
  created_at: string | number;
  private?: boolean;
  source_id?: string;
  content_type?: 'text' | 'input_text' | 'input_textarea' | 'input_email' | 'input_select' | 'cards' | 'form';
  content_attributes?: {
    [key: string]: any;
  };
  sender?: {
    id: number;
    name: string;
    email?: string;
    type?: string;
    thumbnail?: string;
  };
  conversation_id?: number;
  attachments?: Attachment[];
}

// Attachment Types
export interface Attachment {
  id: number;
  message_id: number;
  file_type: 'image' | 'video' | 'audio' | 'file';
  account_id: number;
  file_url: string;
  thumb_url?: string;
  data_url: string;
}

// API Response Types
export interface ConversationsResponse {
  data: {
    meta: {
      mine_count: number;
      unassigned_count: number;
      all_count: number;
      current_page: number;
      total_pages: number;
    };
    payload: Conversation[];
  };
}

export interface MessagesResponse {
  data: {
    meta: {
      contact: Contact;
    };
    payload: Message[];
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface MessageFormData {
  content: string;
}

// API Error Types
export interface APIError {
  message: string;
  errors?: string[];
}
