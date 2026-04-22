import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { AreasProvider } from "@/contexts/AreasContext";

// 路由组件（保持同步导入，体积小）
import { RootRedirect } from "@/components/RootRedirect";
import { LanguageRouteWrapper } from "@/components/LanguageRouteWrapper";
import { HashRedirect } from "@/components/HashRedirect";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Layout 保持同步导入（首屏需要）
import { Layout } from "@/components/Layout";

// 前台页面组件 - 使用懒加载
const Home = React.lazy(() => import("@/views/Home"));
const Properties = React.lazy(() => import("@/views/Properties"));
const PropertyDetail = React.lazy(() => import("@/views/PropertyDetail"));
const About = React.lazy(() => import("@/views/About"));
const Contact = React.lazy(() => import("@/views/Contact"));
const Favorites = React.lazy(() => import("@/views/Favorites"));
const Profile = React.lazy(() => import("@/views/Profile"));
const Blog = React.lazy(() => import("@/views/Blog"));
const BlogPost = React.lazy(() => import("@/views/BlogPost"));

// 用户认证组件 - 懒加载
const UserAuth = React.lazy(() => import("@/views/UserAuth"));

// 管理后台组件 - 懒加载
const Login = React.lazy(() => import("@/views/Login"));
const AdminLayout = React.lazy(() => import("@/components/AdminLayout"));
const AdminDashboard = React.lazy(() => import("@/views/admin/AdminDashboard"));
const AdminProperties = React.lazy(() => import("@/views/admin/AdminProperties"));
const AdminDebugPage = React.lazy(() => import("@/views/admin/AdminDebugPage"));
const CreateProperty = React.lazy(() => import("@/views/admin/CreateProperty"));
const AdminPendingProperties = React.lazy(() => import("@/views/admin/AdminPendingProperties"));
const PropertyLogs = React.lazy(() => import("@/views/admin/PropertyLogs"));
const MembersAnalytics = React.lazy(() => import("@/views/admin/MembersAnalytics"));
const ListingsAnalytics = React.lazy(() => import("@/views/admin/ListingsAnalytics"));

// 创建QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" expand={false} richColors />
          <AuthProvider>
            <AppProvider>
              <AreasProvider>
                <Router>
                  {/* 处理旧的 hash 路由，自动重定向到新路径 */}
                  <HashRedirect />
                  
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                    {/* 1. 根路径智能重定向 */}
                    <Route path="/" element={<RootRedirect />} />

                    {/* 2. 管理后台路由（优先级最高，不受语言前缀影响） */}
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="properties" element={<AdminProperties />} />
                      <Route path="properties/create" element={<CreateProperty />} />
                      <Route path="properties/pending" element={<AdminPendingProperties />} />
                      <Route path="properties/logs" element={<PropertyLogs />} />
                      <Route path="analytics/members" element={<MembersAnalytics />} />
                      <Route path="analytics/listings" element={<ListingsAnalytics />} />
                      <Route path="debug" element={<AdminDebugPage />} />
                    </Route>

                    {/* 3. 多语言前台路由（带语言校验） */}
                    <Route path="/:lang" element={<LanguageRouteWrapper />}>
                      <Route index element={<Layout><Home /></Layout>} />
                      <Route path="properties" element={<Layout><Properties /></Layout>} />
                      <Route path="property/:slugOrId" element={<Layout><PropertyDetail /></Layout>} />
                      <Route path="about" element={<Layout><About /></Layout>} />
                      <Route path="contact" element={<Layout><Contact /></Layout>} />
                      <Route path="favorites" element={<Layout><Favorites /></Layout>} />
                      <Route path="profile" element={<Layout><Profile /></Layout>} />
                      <Route path="blog" element={<Layout><Blog /></Layout>} />
                      <Route path="blog/:slug" element={<Layout><BlogPost /></Layout>} />
                      <Route path="login" element={<UserAuth />} />
                    </Route>

                    {/* 4. 404 兜底（放在最后） */}
                    <Route path="*" element={<RootRedirect />} />
                  </Routes>
                  </Suspense>
                </Router>
              </AreasProvider>
            </AppProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
  );
};

export default App;
