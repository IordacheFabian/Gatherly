import { motion } from "framer-motion";
import { Compass, Users, Zap, Globe, Heart, Shield } from "lucide-react";
import PageTransition from "@/components/PageTransition";

const highlights = [
  { icon: Compass, title: "Discover", desc: "Find activities that match your interests and lifestyle in your area." },
  { icon: Users, title: "Connect", desc: "Meet like-minded people and build meaningful relationships through shared experiences." },
  { icon: Zap, title: "Create", desc: "Organize your own activities and bring people together around what you love." },
  { icon: Globe, title: "Explore", desc: "Step out of your comfort zone and try something new with a supportive community." },
  { icon: Heart, title: "Belong", desc: "Join a vibrant community where everyone is welcome and valued." },
  { icon: Shield, title: "Trust", desc: "Verified organizers, reviews, and a safe platform to ensure great experiences." },
];

const About = () => (
  <PageTransition>
    <div className="pt-24 pb-20 container mx-auto px-6">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="chip-active text-xs mb-4 inline-block">About Us</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Life is Better{" "}
            <span className="gradient-text">Together</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Reactivities was born from a simple belief: the best moments in life are shared.
            We're building the platform where people come together to discover new passions,
            forge real connections, and create unforgettable memories.
          </p>
        </motion.div>
      </div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass p-8 md:p-12 rounded-2xl mb-16 text-center animated-border"
      >
        <h2 className="text-2xl font-display font-bold mb-4 gradient-text">Our Mission</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          To empower people everywhere to break out of their routines, discover inspiring activities,
          and connect with communities that enrich their lives. We believe that every person deserves
          access to meaningful experiences — and the people to share them with.
        </p>
      </motion.div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {highlights.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-xl hover-lift group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <h.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{h.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass p-8 rounded-2xl"
      >
        <h2 className="text-2xl font-display font-bold text-center mb-8">Growing Community</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Active Users" },
            { value: "2,500+", label: "Activities Created" },
            { value: "50+", label: "Cities" },
            { value: "98%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-display font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </PageTransition>
);

export default About;
