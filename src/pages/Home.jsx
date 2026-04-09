
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";


import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
{/*import TimelineSection from "../components/TimelineSection";*/}
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="app-root">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        {/*<TimelineSection />*/}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}