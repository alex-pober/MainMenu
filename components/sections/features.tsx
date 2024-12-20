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
                src="/images/menu-item-edit-color.webp"
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
                Easily create unlimited menus, items, and specials. Customize with add-ons, toggle availability with a click, and explore even more features.             
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
              <h3 className="text-3xl font-bold">Dashboard for Your Menu</h3>
              <p className="text-gray-600 dark:text-gray-400">
              Streamline your restaurant’s operations with an all-in-one dashboard. Edit everything from one place.
              </p>
            </div>
            <div className="relative">
              <Image
                src="/images/dashboard-demo.webp"
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
                src="/images/633shots_so.png"
                alt="Menu Creation Feature"
                width={800}
                height={600}
                className="rounded-lg"
                quality={90}
              />
            </div>
            <div className="space-y-4 max-w-md">
              <h3 className="text-3xl font-bold">Designed for Mobile, Loved by Diners</h3>
              <p className="text-gray-600 dark:text-gray-400">
              Deliver a seamless digital menu experience with a mobile-first design. Easy navigation, fast loading, and an intuitive interface ensure your diners enjoy every interaction.              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export function FeaturesSection() {
  return (
    <>
      <FeatureShowcase />
    </>
  );
}