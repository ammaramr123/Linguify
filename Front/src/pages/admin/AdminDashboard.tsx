import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Image, FileSearch, ShieldAlert, BarChart3, ArrowRight, Loader2 } from 'lucide-react';
import { getAllImages, getUnresolvedReports } from '../../api/adminApi';

export const AdminDashboard = () => {
  const [counts, setCounts] = useState({ images: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [imagesRes, reportsRes] = await Promise.all([
          getAllImages(0, 1).catch(err => {
            console.error("Images fetch error:", err);
            return { totalElements: 0, content: [] };
          }),
          getUnresolvedReports(0, 1).catch(err => {
            console.error("Reports fetch error:", err);
            return { totalElements: 0, content: [] };
          })
        ]);
        
        const imagesCount = imagesRes?.totalElements ?? (Array.isArray(imagesRes?.content) ? imagesRes.content.length : 0);
        const reportsCount = reportsRes?.totalElements ?? (Array.isArray(reportsRes?.content) ? reportsRes.content.length : 0);

        setCounts({
          images: imagesCount,
          reports: reportsCount
        });
      } catch (error) {
        console.error("Dashboard general error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Total Images', icon: Image, count: counts.images.toLocaleString(), link: '/admin/images', color: 'text-blue-500' },
    { title: 'Unresolved Reports', icon: ShieldAlert, count: counts.reports.toLocaleString(), link: '/admin/reports', color: 'text-red-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">System <span className="text-primary">Overview</span></h1>
        <p className="text-muted-foreground">Real-time metrics from the translation platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((stat, i) => (
          <Link key={i} to={stat.link} className="group">
            <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground mb-4">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : stat.count}
                </div>
                <div className="flex items-center text-xs text-primary font-medium group-hover:gap-2 transition-all">
                  Manage Now <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <Link to="/admin/users" className="block">
          <Card className="bg-secondary/30 border-border hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
               <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription>Search reports by specific User ID</CardDescription>
               </div>
               <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary" />
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
};
