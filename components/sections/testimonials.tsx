"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Restaurant Owner",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    content: "MainMenu.io transformed how we handle our menu. Our customers love the digital experience, and we've seen a 25% increase in orders since implementing it.",
    restaurant: "The Rustic Table"
  },
  {
    name: "Michael Chen",
    role: "Executive Chef",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    content: "The ability to update our menu in real-time has been game-changing. We can adjust prices and availability instantly, and the analytics help us make better decisions.",
    restaurant: "Fusion Kitchen"
  },
  {
    name: "Emily Rodriguez",
    role: "Restaurant Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    content: "The customer support is exceptional. They helped us set everything up and are always there when we need them. Best decision we've made for our restaurant.",
    restaurant: "Coastal Bites"
  }
];

export function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Loved by Restaurants Worldwide</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what restaurant owners and managers are saying about MainMenu.io
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-primary">{testimonial.restaurant}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}