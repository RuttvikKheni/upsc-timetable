"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

import { ArrowRight, Clock4, Dot, PencilLine, PencilRuler, Quote, User } from "lucide-react";

import LogoHeader from "../components/ui/LogoHeader";
import { MultiStepForm } from "../components/multi-step-form";
import Footer from "../components/ui/Footer";
import { Button } from '../components/ui/button';

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowLoader(false);
      setShowWelcome(true);
    }, 500);
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
    return () => {
      clearTimeout(loaderTimer);
      clearTimeout(welcomeTimer);
    };
  }, []);
  return (
    <main>
      {showLoader ? (
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
      ) : showWelcome ? (
        <div>
          <div className="flex justify-center items-center min-h-screen px-4">
            <div className="bg-white shadow-md rounded-xl max-w-full sm:max-w-2xl container h-full mx-auto my-6 px-4 sm:px-6 md:px-8 py-8 w-full text-center">
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-primary overflow-hidden border-2 ring-4 ring-primary/20 sm:border-4 border-primary shadow-lg">
                  <Image src="/logo.jpg" alt="Proxy Gyan Logo" className='!w-[80px] !h-[80px]' width={80} height={80} />
                </div>
              </div>
              <h2 className="text-lg sm:text-[22px] font-semibold mb-1 mt-6">Welcome to Your UPSC Preparation Assessment</h2>
              <p className="!text-[13px] sm:!text-sm md:!text-[15px] mb-8">This comprehensive assessment will help tailor a study plan specific to your needs and preparation level.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                    <PencilLine className='w-4 h-4 text-primary' />
                  </div>
                  <p className="!text-[13px]">Personalized study plan</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                    <Clock4 className='w-4 h-4 text-primary' />
                  </div>
                  <p className="!text-[13px]">Time management strategy</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                    <PencilRuler className='w-4 h-4 text-primary' />
                  </div>
                  <p className="!text-[13px]">Subject-specific approach</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                    <User className='w-4 h-4 text-primary' />
                  </div>
                  <p className="!text-[13px]">Personality-based learning</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 w-fit mx-auto text-sm mb-6 py-4 px-20 rounded-lg">
                <div className="flex flex-wrap justify-center gap-4">
                  <div>
                    <span className="font-bold">7</span><br />Sections
                  </div>
                  <div>
                    <span className="font-bold">~10</span><br />Minutes
                  </div>
                  <div>
                    <span className="font-bold">100%</span><br />Personalized
                  </div>
                </div>
              </div>
              <Button className="rounded-full h-10 px-6 flex gap-2 items-center justify-center mx-auto">
                Start Assessment <ArrowRight className='w-5 h-5' />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <LogoHeader />
          <MultiStepForm />
          <Footer />
        </div>
      )}
    </main>
  );
} 