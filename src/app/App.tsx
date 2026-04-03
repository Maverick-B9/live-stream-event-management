import { RouterProvider } from 'react-router';
import { router } from './routes/index';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { Toaster } from './components/ui/sonner';
import { Footer } from './components/shared/Footer';

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
        <Footer />
      </EventProvider>
    </AuthProvider>
  );
}
