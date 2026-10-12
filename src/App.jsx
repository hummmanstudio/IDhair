import { lazy, Suspense, useEffect, useState } from "react";
import { defaultPageMetadata, getPageMetadata, getPageTitle, notFoundTitles } from "./data/pageTitles";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, matchRoutes, createRoutesFromElements } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AniProvider from "./hook/Aniprovider";
import CursorFollower from "./hook/CursorFollower";
import useFadeSlice from "./hook/useFadeSlice";
import Main from "./pages/Main";
import MainEn from "./pagesEn/Main";
import AboutEn from "./pagesEn/About";
import AcademyEn from "./pagesEn/Academy";
import RecruitEn from "./pagesEn/Recruit";
import MagazineEn from "./pagesEn/Magazine";
import MagazinePostEn from "./pagesEn/MagazinePost";
import About from "./pages/About";
import Academy from "./pages/Academy";
import Recruit from "./pages/Recruit";
import Magazine from "./pages/Magazine";
import MagazineDetail from "./pages/MagazinePost";
import NotFound from "./pages/NotFound";
import "./styles/common.scss";
import LenisProvider from "./lib/Lenis";

const AdminStudio = lazy(() => import("./pages/AdminStudio"));

const siteRoutes = (
  <>
    <Route path="/" element={<Main />} />
    <Route path="/en" element={<MainEn />} />
    <Route path="/en/about" element={<AboutEn />} />
    <Route path="/en/academy" element={<AcademyEn />} />
    <Route path="/en/recruit" element={<RecruitEn />} />
    <Route path="/en/magazine" element={<Navigate to="/en/magazine/our-picks" replace />} />
    <Route path="/en/magazine/:category" element={<MagazineEn />} />
    <Route path="/en/magazine/:category/post/:id" element={<MagazinePostEn />} />
    <Route path="/en/magazine/:category/:pageSlug" element={<MagazineEn />} />
    <Route path="/en/magazine-post" element={<MagazinePostEn />} />
    <Route path="/about" element={<About />} />
    <Route path="/academy" element={<Academy />} />
    <Route path="/recruit" element={<Recruit />} />
    <Route path="/magazine" element={<Navigate to="/magazine/our-picks" replace />} />
    <Route path="/magazine/:category" element={<Magazine />} />
    <Route path="/magazine/:category/post/:id" element={<MagazineDetail />} />
    <Route path="/magazine/:category/:pageSlug" element={<Magazine />} />
    <Route path="/magazine-post" element={<MagazineDetail />} />
    {/* 매장 안내: 살롱 팝업이 열린 채로 보이는 주소 (네이버 검색 결과·옛 /shop/ 주소의 도착지) */}
    <Route path="/salon" element={null} />
    <Route path="/en/salon" element={null} />
    <Route path="*" element={<NotFound />} />
  </>
);
const siteRouteObjects = createRoutesFromElements(siteRoutes);
const salonPagePattern = /^(\/en)?\/salon\/?$/;

function FadeSliceProvider() {
  useFadeSlice();
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [salonOpen, setSalonOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isEnglishPage = /^\/en(?:\/|$)/.test(location.pathname);
  const isSalonPage = salonPagePattern.test(location.pathname);
  const isNotFound = matchRoutes(siteRouteObjects, location)?.at(-1)?.route.path === "*";

  // /salon 에서 팝업을 닫으면 메인으로 보낸다
  const handleSalonOpen = (open) => {
    setSalonOpen(open);
    if (!open && isSalonPage) navigate(isEnglishPage ? "/en" : "/", { replace: true });
  };

  useEffect(() => {
    const metadata = getPageMetadata(location.pathname) || defaultPageMetadata;
    document.documentElement.lang = metadata.language;
    [
      ['meta[name="description"]', metadata.description],
      ['meta[property="og:description"]', metadata.description],
      ['meta[property="og:site_name"]', metadata.siteName],
    ].forEach(([selector, content]) => {
      document.querySelector(selector)?.setAttribute("content", content);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (isAdminRoute) return;
    const title = isNotFound ? notFoundTitles[isEnglishPage ? "en" : "ko"] : getPageTitle(location.pathname);
    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `https://www.idhair.com${location.pathname}`);
    // 없는 주소는 검색 결과에 올리지 않는다 (옛 사이트 주소가 빈 화면으로 수집되던 문제)
    let robots = document.querySelector('meta[name="robots"]');
    if (isNotFound) {
      document.querySelector('link[rel="canonical"]')?.remove();
      if (!robots) {
        robots = document.createElement('meta');
        robots.name = 'robots';
        document.head.appendChild(robots);
      }
      robots.content = 'noindex';
      return;
    }
    robots?.remove();
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://www.idhair.com${location.pathname}`;
  }, [location.pathname, isAdminRoute, isNotFound, isEnglishPage]);

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="admin_studio_loading">Loading Studio...</div>}>
        <Routes>
          <Route path="/admin/*" element={<AdminStudio />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <FadeSliceProvider />
      <AniProvider />
      <LenisProvider />

      <CursorFollower />

      <Header salonOpen={salonOpen || isSalonPage} setSalonOpen={handleSalonOpen} />
      <Routes>{siteRoutes}</Routes>
      <Footer onOpenSalon={() => setSalonOpen(true)} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}


export default App;
