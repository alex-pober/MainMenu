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
  <section id="pricing" className="relative py-24 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.h2 
          className="text-4xl font-bold bg-gradient-to-r from-[#FD851C] to-[#FD851C] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          One Simple Plan
        </motion.h2>
        <motion.p 
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Everything you need, no hidden fees, cancel anytime
        </motion.p>
      </motion.div>

      <div ref={ref} className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#FD851C]/20 via-[#FD851C]/10 to-transparent rounded-2xl transform scale-105 blur-2xl" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FD851C]/10 via-white to-[#FD851C]/10 rounded-2xl transform scale-105 blur-xl" />
          <div className="relative rounded-2xl overflow-hidden border border-[#FD851C]/20 shadow-xl bg-white">
          <Card className='border-none p-6'> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <CardTitle className="text-3xl mb-3">Everything You Need</CardTitle>
                  <CardDescription className="text-lg">First 30 days on us</CardDescription>
                </div>
                
                <CardContent className="p-0 border-none">
                  <ul className="space-y-4">
                    {[
                      "Unlimited Menu Items",
                      "QR Code Generation",
                      "Real-time Menu Updates",
                      "Mobile Optimized Design",
                      "Cancel Anytime"
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-600">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FD851C]/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#FD851C]" />
                        </div>
                        <span className="text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div className="text-center md:text-right">
                  <div className="flex items-start justify-center md:justify-end">
                    <span className="text-xl mt-2">$</span>
                    <span className="text-6xl font-bold text-[#FD851C]">9.99</span>
                    <span className="text-xl mt-2">/mo</span>
                  </div>
                </div>
                
                <Button
                  className="w-full bg-[#FD851C] hover:bg-[#FD851C]/90 text-white rounded-full h-14 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start 30-Day Free Trial
                </Button>
              </div>
            </div>
          </Card>
          </div>
        </motion.div>
        <div/>
      </div>
    </div>
  </section>
);
}