import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

// Pages
import SplashScreen from '@/pages/SplashScreen';
import Onboarding from '@/pages/Onboarding';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import ReferralRedirect from '@/pages/ReferralRedirect';
import InfluencerDashboard from '@/pages/influencer/Dashboard';
import InfluencerMissions from '@/pages/influencer/Missions';
import InfluencerRewards from '@/pages/influencer/Rewards';
import InfluencerReferrals from '@/pages/influencer/Referrals';
import InfluencerWithdraw from '@/pages/influencer/Withdraw';
import InfluencerProfile from '@/pages/influencer/Profile';
import InfluencerStoryCreator from '@/pages/influencer/StoryCreator';
import InfluencerLeaderboard from '@/pages/influencer/Leaderboard';
import DriverMap from '@/pages/driver/DriverMap';
import DriverHistory from '@/pages/driver/History';
import DriverEarnings from '@/pages/driver/Earnings';
import DriverProfile from '@/pages/driver/Profile';
import AdminOverview from '@/pages/admin/Overview';
import AdminMissions from '@/pages/admin/Missions';
import AdminPrizes from '@/pages/admin/Prizes';
import AdminCommissions from '@/pages/admin/Commissions';
import AdminOrders from '@/pages/admin/Orders';
import AdminOperations from '@/pages/admin/Operations';
import InstallPWA from '@/pages/InstallPWA';
import Terms from '@/pages/Terms';
import InfluencerPersonalData from '@/pages/influencer/PersonalData';
import DriverPersonalData from '@/pages/driver/PersonalData';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function AuthListener() {
  const { setUser, setLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchProfile(), 0);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, fetchProfile]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <AuthListener />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/install" element={<InstallPWA />} />
          <Route path="/r/:code" element={<ReferralRedirect />} />
          <Route path="/terms" element={<Terms />} />

          {/* Auth */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Influencer — Protected */}
          <Route element={<ProtectedRoute requiredRole="influencer" />}>
            <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
            <Route path="/influencer/missions" element={<InfluencerMissions />} />
            <Route path="/influencer/rewards" element={<InfluencerRewards />} />
            <Route path="/influencer/referrals" element={<InfluencerReferrals />} />
            <Route path="/influencer/withdraw" element={<InfluencerWithdraw />} />
            <Route path="/influencer/profile" element={<InfluencerProfile />} />
            <Route path="/influencer/personal-data" element={<InfluencerPersonalData />} />
            <Route path="/influencer/story-creator" element={<InfluencerStoryCreator />} />
            <Route path="/influencer/leaderboard" element={<InfluencerLeaderboard />} />
          </Route>

          {/* Driver — Protected */}
          <Route element={<ProtectedRoute requiredRole="driver" />}>
            <Route path="/driver/map" element={<DriverMap />} />
            <Route path="/driver/history" element={<DriverHistory />} />
            <Route path="/driver/earnings" element={<DriverEarnings />} />
            <Route path="/driver/profile" element={<DriverProfile />} />
            <Route path="/driver/personal-data" element={<DriverPersonalData />} />
          </Route>

          {/* Admin — Protected */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/missions" element={<AdminMissions />} />
            <Route path="/admin/prizes" element={<AdminPrizes />} />
            <Route path="/admin/commissions" element={<AdminCommissions />} />
            <Route path="/admin/operations" element={<AdminOperations />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
