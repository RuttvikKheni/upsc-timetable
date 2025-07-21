"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { Dot, Quote } from "lucide-react";
import LogoHeader from "../components/ui/LogoHeader";
import { MultiStepForm } from "../components/multi-step-form";
import Footer from "../components/ui/Footer";

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main>
      {
        showLoader ? (
          <div className="flex justify-center items-center h-screen px-4">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <div className="rounded-lg bg-primary overflow-hidden border-2 sm:border-4 border-primary shadow-lg">
                  <Image src="/logo.jpg" alt="Proxy Gyan Logo" className='!w-[30px] !h-[30px] sm:!w-[40px] sm:!h-[40px]' width={30} height={30} />
                </div>
                <div className="ml-3 text-left">
                  <h1 className="text-base md:text-lg lg:text-xl xl:text-[22px] text-nowrap font-semibold">Proxy Gyan</h1>
                  <p className="!text-xs sm:!text-sm text-body">UPSC Preparation Platform</p>
                </div>
              </div>
              <div className="my-12">
                <div className="flex justify-center mb-4">
                  <div className="h-10 w-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
                </div>
                <h2 className="text-base sm:text-lg font-medium text-foreground mb-1 sm:mb-2">Launching your UPSC prep space...</h2>
                <p className="text-xs sm:text-sm text-body">Please hold on while we load your experience.</p>
              </div>
              <div className="bg-white shadow-md p-4 rounded-md max-w-md mx-auto">
                <Quote className="mx-auto transform rotate-180 w-[22px] h-[22px] text-gray-400" />
                <p className="text-sm sm:text-base text-body italic text-center my-2 sm:my-3 md:my-4">
                  “Success doesn&#39;t come from what you do occasionally, but from what you do consistently.”
                </p>
                <div className="flex items-center justify-center text-gray-400">
                  <Dot className="w-4 h-4" strokeWidth={5} />
                  <Dot className="w-4 h-4" strokeWidth={5} />
                  <Dot className="w-4 h-4" strokeWidth={5} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <LogoHeader />
            <MultiStepForm />
            <Footer />
          </div>
        )
      }
    </main>
  );
} 