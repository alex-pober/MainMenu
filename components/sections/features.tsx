"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { QrCode, BarChart3, RefreshCcw, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';

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

const FeatureShowcase = () => {
  const { ref: ref1, inView: inView1 } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const { ref: ref2, inView: inView2 } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const { ref: ref3, inView: inView3 } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-center py-16">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="space-y-24">
          {/* Menu Creation Feature */}
          <motion.div
            ref={ref1}
            initial={{ opacity: 0, y: 20 }}
            animate={inView1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
          >
            <div className="relative">
              <Image
                src="/images/create-menu-feature2.webp"
                alt="Menu Creation Feature"
                width={800}
                height={600}
                className="rounded-lg"
                priority
                quality={90}
              />
            </div>
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-bold">Effortless Menu Customization</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create unlimited menus, toggle them on/off, or schedule when diners see them—simple and flexible!
              </p>
            </div>
          </motion.div>

          {/* Menu Management */}
          <motion.div
            ref={ref2}
            initial={{ opacity: 0, y: 20 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
          >
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-bold">Categories and Items</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every menu is set up with categories and items, making it easy to navigate and prevent endless scrolling for diners.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/images/digital-menu-with-categories.webp"
                alt="Menu Creation Feature"
                width={800}
                height={600}
                className="rounded-lg"
                quality={90}
              />
            </div>
          </motion.div>

          {/* Item Customization */}
          <motion.div
            ref={ref3}
            initial={{ opacity: 0, y: 20 }}
            animate={inView3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
          >
            <div className="relative">
              <Image
                src="/images/menu-item-customization.webp"
                alt="Menu Creation Feature"
                width={800}
                height={600}
                className="rounded-lg"
                quality={90}
              />
            </div>
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-bold">Item Customization</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Every menu item customized to display everything you want, including images, descriptions, and prices.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <>
      <FeatureShowcase />
      <section id="features" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-bold mb-4"
            >
              Powerful Features for Modern Restaurants
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Everything you need to digitize your menu and enhance your customers&apos; dining experience.
            </motion.p>
          </motion.div>

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
    </>
  );
}