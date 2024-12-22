"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function PricingSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="pricing" className="flex items-center py-8">
      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 space-y-4"
        >
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#FD851C] to-[#ff963a] bg-clip-text text-transparent">One Simple Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need, no hidden fees, cancel anytime
          </p>
        </motion.div>

        <div ref={ref} className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#FD851C]/10 shadow-lg">
              <Card className="border-none p-8"> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <CardTitle className="text-3xl font-bold mb-3">Everything You Need</CardTitle>
                      <CardDescription className="text-lg text-gray-600">First 30 days on us</CardDescription>
                    </div>
                    
                    <CardContent className="p-0">
                      <ul className="space-y-2">
                        {[
                          "Unlimited Menu Items",
                          "QR Code Generation",
                          "Real-time Menu Updates",
                          "Mobile Optimized Design",
                          "Cancel Anytime"
                        ].map((feature) => (
                          <li key={feature} className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#FD851C]/10 flex items-center justify-center">
                              <Check className="w-6 h-6 text-[#FD851C]" />
                            </div>
                            <span className="text-lg text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>

                  <div className="flex flex-col justify-between space-y-8">
                    <div className="text-center md:text-right">
                      <div className="flex items-start justify-center md:justify-end">
                        <span className="text-2xl mt-2 text-gray-600">$</span>
                        <span className="text-6xl font-bold text-[#FD851C]">9.99</span>
                        <span className="text-2xl mt-2 text-gray-600">/mo</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-[#FD851C] hover:bg-[#FD851C]/90 text-white text-lg px-8 rounded-full h-12"
                    >
                      Start 30-Day Free Trial
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}