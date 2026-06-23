export type Tab = 'dashboard' | 'defi' | 'academy';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}
