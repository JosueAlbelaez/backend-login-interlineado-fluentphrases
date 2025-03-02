export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          birth_date: string
          email: string
          username: string
          phone: string | null
          subscription_type: string
          subscription_end_date: string | null
          daily_phrases_count: number
          last_phrases_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          birth_date: string
          email: string
          username: string
          phone?: string | null
          subscription_type?: string
          subscription_end_date?: string | null
          daily_phrases_count?: number
          last_phrases_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          birth_date?: string
          email?: string
          username?: string
          phone?: string | null
          subscription_type?: string
          subscription_end_date?: string | null
          daily_phrases_count?: number
          last_phrases_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      phrases: {
        Row: {
          id: string
          target_text: string
          translated_text: string
          category: string
          language: string
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          target_text: string
          translated_text: string
          category: string
          language: string
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          target_text?: string
          translated_text?: string
          category?: string
          language?: string
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}