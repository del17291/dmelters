/**
 * Client service for text chat fallback and API communication.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  audio?: string | null;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  language: 'en' | 'fr' | 'de' = 'en',
  generateVoice: boolean = false
): Promise<{ text: string; audio: string | null }> {
  const payload = {
    message,
    history: history.map((h) => ({
      role: h.role,
      text: h.text,
    })),
    language,
    generateVoice,
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to send message (${response.status})`);
  }

  return response.json();
}

export async function checkApiHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch (e) {
    return { status: 'error', hasApiKey: false };
  }
}
