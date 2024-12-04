"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background to-background" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Transform Your Menu Into a <span className="text-primary">Digital Experience</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Elevate your restaurant with interactive digital menus, real-time updates, and powerful analytics. The future of dining starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg bg-primary hover:bg-primary/90" onClick={() => router.push('/auth')}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-primary text-primary hover:bg-primary/10">
                Watch Demo
              </Button>
            </div>
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">Trusted by leading restaurants worldwide</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de"
                alt="Restaurant menu preview"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}