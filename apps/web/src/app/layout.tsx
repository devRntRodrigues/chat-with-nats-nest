import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { NatsProvider } from '@/contexts/NatsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'Real-time chat application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NatsProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </NatsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
