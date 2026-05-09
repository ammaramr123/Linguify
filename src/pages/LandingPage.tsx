import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Languages, Image as ImageIcon, Globe, Zap, History, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-150 bg-primary/10 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              Image Captions, <span className="text-primary">Translated.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Upload images and watch as our AI translates captions in real-time. 
              Break language barriers with visual context.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-lg shadow-primary/20">
                  Get Started for Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-border text-lg px-8 py-6 h-auto hover:bg-primary/10 text-primary">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-border bg-background/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Real-time SSE", desc: "Watch updates happen live as the AI processes your image." },
              { icon: Globe, title: "Multi-language", desc: "Support for Arabic, German, French, Spanish, and more." },
              { icon: History, title: "History Comparison", desc: "Compare original and translated images side-by-side." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group shadow-xl"
              >
                <feature.icon className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
