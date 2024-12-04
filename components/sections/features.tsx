"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { QrCode, BarChart3, RefreshCcw, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    title: "QR Code Integration",
    description: "Generate unique QR codes for instant menu access. Customers can scan and browse your menu on their devices.",
    icon: QrCode
  },
  {
    title: "Real-time Updates",
    description: "Update prices, items, and specials instantly. Changes reflect immediately across all digital menus.",
    icon: RefreshCcw
  },
  {
    title: "Powerful Analytics",
    description: "Track viewing patterns, popular items, and customer behavior to optimize your menu and pricing.",
    icon: BarChart3
  },
  {
    title: "Mobile Optimized",
    description: "Beautiful, responsive design ensures your menu looks perfect on any device, from phones to tablets.",
    icon: Smartphone
  }
];

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Modern Restaurants</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to digitize your menu and enhance your customers' dining experience.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}