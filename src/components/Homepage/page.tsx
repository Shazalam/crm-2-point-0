// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

import Header from './layout/header';
import Hero from './sections/hero';
import SocialProof from './sections/social-proof';
import Features from './sections/features';
import ProductShowcase from './sections/product-showcase';
import Testimonials from './sections/testimonials';
import CTA from './sections/cta';
import Footer from './layout/footer';
import LoadingScreen from '../LoadingScreen';


export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
    <LoadingScreen/>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Header />
      <Hero />
      <SocialProof />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}