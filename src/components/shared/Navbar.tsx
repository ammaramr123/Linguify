import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Languages, History, FileWarning, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary/80 transition-colors">
          <Languages className="w-8 h-8" />
          <span>Linguify</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === 'USER' && (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/history">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary">
                      <History className="w-4 h-4" />
                      History
                    </Button>
                  </Link>
                  <Link to="/reports">
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary">
                      <FileWarning className="w-4 h-4" />
                      Reports
                    </Button>
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/10">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleLogout} className="gap-2 border-border text-primary hover:bg-primary/10">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-white border-0">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
