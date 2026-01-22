import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { InboxPage } from "./pages/InboxPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { GeneratorPage } from "./pages/GeneratorPage";
import { ApprovalPage } from "./pages/ApprovalPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/generator" element={<GeneratorPage />} />
          <Route path="/generator/:newsId" element={<GeneratorPage />} />
          <Route path="/approval" element={<ApprovalPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
