import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./hooks/useAuth";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import Photos from "./pages/Photos";
import Creators from "./pages/Creators";
import Watchlist from "./pages/Watchlist";
import Lists from "./pages/Lists";
import Upload from "./pages/Upload";
import TitleDetail from "./pages/TitleDetail";
import DirectorProfile from "./pages/DirectorProfile";
import PersonProfile from "./pages/PersonProfile";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";  // ← EKLE

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/lists" element={<Lists />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/title/:id" element={<TitleDetail />} />
            <Route path="/director/:id" element={<DirectorProfile />} />
            <Route path="/person/:id" element={<PersonProfile />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />  {/* ← EKLE */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;