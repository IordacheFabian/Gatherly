import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Menu, X, Compass, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { to: "/", label: "Activities" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center glow-primary transition-all duration-300 group-hover:scale-110">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">
            Reactivities
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg hover:text-foreground"
                style={{ color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 gradient-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Profile & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to={`/profile/${user.id}`}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{user.displayName}</span>
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200 text-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-glass-border bg-muted/30 hover:bg-muted/60 transition-all duration-200"
            >
              <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Login</span>
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden glass-strong border-t border-glass-border"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                    className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
