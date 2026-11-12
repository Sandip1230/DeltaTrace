import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { LiveProvider, useLive } from "../../context/LiveContext";
import { ScopeProvider } from "../../context/ScopeContext";
import useSpotlight from "../../hooks/useSpotlight";
import CyberBackground from "../ui/CyberBackground";
import BackToTop, { ScrollProgress } from "../ui/BackToTop";
import Header from "./Header";
import ScopeBar from "./ScopeBar";
import SideMenu from "./SideMenu";
import FloatingNav from "./FloatingNav";

function Shell() {
  const { tick } = useLive();
  const { pathname } = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [menu, setMenu] = useState(false);
  useSpotlight();

  useEffect(() => {
    api.get("/alerts/stats").then((r) => setAlertCount(r.data.total)).catch(() => {});
  }, [tick]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenu(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <CyberBackground />
      <ScrollProgress />
      <Header menuOpen={menu} onMenu={() => setMenu((m) => !m)} />
      <SideMenu open={menu} onClose={() => setMenu(false)} alertCount={alertCount} />
      {!pathname.startsWith("/india") && <ScopeBar />}

      <main className="mx-auto max-w-6xl px-3 pb-40 pt-6 sm:px-4">
        <motion.div key={pathname} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4 }}>
          <Outlet />
        </motion.div>
      </main>

      <BackToTop bottom={112} />
      <FloatingNav alertCount={alertCount} />
    </div>
  );
}

export default function AppShell() {
  return (
    <LiveProvider>
      <ScopeProvider>
        <Shell />
      </ScopeProvider>
    </LiveProvider>
  );
}