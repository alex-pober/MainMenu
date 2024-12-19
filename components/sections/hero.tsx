"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Smartphone, Zap, QrCode } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 " />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center mt-0 ">
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              The Ultimate{' '}
              <span className="bg-gradient-to-r from-[#FD851C] to-[#FD851C] bg-clip-text text-transparent inline-block">Mobile Menu</span>
              {' '}<span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Experience</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Elevate your restaurant with interactive mobile menus and real-time updates. The future of dining starts here.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="text-lg bg-[#FD851C] hover:bg-[#FD851C]/90 text-white px-8 rounded-full h-12" onClick={() => router.push('/auth')}>
                Get Started Free
              </Button>
              <Button size="lg" className="text-lg bg-white hover:bg-orange-50 text-[#FD851C] px-8 rounded-full h-12 border border-[#FD851C]" onClick={() => router.push('/demo')}>
                Watch Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-8 md:gap-12 items-center justify-items-center max-w-2xl mx-auto pt-12"
          >
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-[#FD851C]/10 rounded-xl">
                <Smartphone className="w-6 h-6 text-[#FD851C]" />
              </div>
              <div className="font-semibold text-xl text-gray-600">Mobile Optimized</div>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-[#FD851C]/10 rounded-xl">
                <Zap className="w-6 h-6 text-[#FD851C]" />
              </div>
              <div className="font-semibold text-xl text-gray-600">Instant Updates</div>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-[#FD851C]/10 rounded-xl">
                <QrCode className="w-6 h-6 text-[#FD851C]" />
              </div>
              <div className="font-semibold text-xl text-gray-600">QR Integration</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 mx-auto max-w-7xl"
          >
            {/* <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FD851C]/20 via-[#FD851C]/10 to-transparent rounded-2xl transform scale-105 blur-2xl" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FD851C]/10 via-white to-[#FD851C]/10 rounded-2xl transform scale-105 blur-xl" /> */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src="/images/341shots_so.webp"
                alt="Restaurant menu dashboard preview"
                fill
                className="object-fill"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}