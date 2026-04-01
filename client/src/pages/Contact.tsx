import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Phone, Send, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageTransition from "@/components/PageTransition";

const faqs = [
  { q: "How do I create an activity?", a: "Click the + button on the activities page, fill in the details, and publish. It's that simple!" },
  { q: "Is Reactivities free to use?", a: "Yes! Creating an account and joining activities is completely free. Organizers can optionally charge for premium events." },
  { q: "How do I report an issue?", a: "Use the contact form below or email us directly. We typically respond within 24 hours." },
];

const Contact = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="chip-active text-xs mb-4 inline-block">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              We'd Love to{" "}
              <span className="gradient-text">Hear From You</span>
            </h1>
            <p className="text-muted-foreground">Have a question, suggestion, or just want to say hello? Reach out anytime.</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass p-8 rounded-2xl">
              <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Send a Message
              </h2>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">First Name</label>
                    <Input placeholder="John" className="bg-muted/30 border-glass-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                    <Input placeholder="Doe" className="bg-muted/30 border-glass-border" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" placeholder="john@example.com" className="bg-muted/30 border-glass-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Subject</label>
                  <Input placeholder="What's this about?" className="bg-muted/30 border-glass-border" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea placeholder="Tell us more..." className="bg-muted/30 border-glass-border min-h-[120px] resize-none" />
                </div>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button className="w-full gradient-primary text-primary-foreground border-0 glow-primary">
                    <Send className="w-4 h-4 mr-2" /> Send Message
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Info + FAQ */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-xl">
              <h3 className="font-display font-semibold mb-4">Contact Info</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "hello@reactivities.app" },
                  { icon: Phone, label: "+1 (555) 123-4567" },
                  { icon: MapPin, label: "San Francisco, CA" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-xl">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" /> Quick FAQ
              </h3>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-sm font-medium hover:bg-muted/30 rounded-lg transition-colors text-left"
                    >
                      {faq.q}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-3 pb-3 text-sm text-muted-foreground">{faq.a}</p>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
