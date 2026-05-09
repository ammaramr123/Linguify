import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getUserReportsAdmin } from '../../api/adminApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, UserMinus, Shield, User as UserIcon, Mail, FileText, Loader2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedImage from '../../components/AuthenticatedImage';

export const AdminUsers = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const size = 10;

  const handleSearch = async (e?: React.FormEvent, targetPage?: number) => {
    e?.preventDefault();
    if (!userId.trim()) return;
    
    const pageToFetch = targetPage !== undefined ? targetPage : 0;
    if (targetPage === undefined) setPage(0);

    setLoading(true);
    setUserData(null);
    try {
      const res = await getUserReportsAdmin(userId, pageToFetch, size);
      console.log('User Reports Raw:', res);
      
      const root = res?.data || res;
      const contentArray = root?.content || (Array.isArray(root) ? root : []);
      
      setUserData({
        content: contentArray,
        totalElements: root?.totalElements ?? contentArray.length,
        totalPages: root?.totalPages ?? Math.ceil((root?.totalElements || contentArray.length) / size)
      });
      
      if (contentArray.length === 0 && pageToFetch === 0) {
        toast.info('User found but has no image reports.');
      }
    } catch (error) {
      toast.error('User not found or lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSearch(undefined, newPage);
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Delete User #${userId} and all their data?`)) return;
    try {
      await deleteUser(userId);
      toast.success('User successfully removed from system');
      setUserData(null);
      setUserId('');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const unresolvedItems = (userData?.content || []).filter((item: any) => item.report && !item.report.resolved);
  const resolvedItems = (userData?.content || []).filter((item: any) => item.report && item.report.resolved);
  const otherItems = (userData?.content || []).filter((item: any) => !item.report);

  const fixImage = (url: string) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Detect if it's a raw base64 string (no header)
    const isBase64 = url.length > 50 && !url.includes('.') && !url.includes(' ') && !url.includes('/');
    if (isBase64) {
      return `data:image/png;base64,${url}`;
    }
    
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `http://13.62.227.111:8080/${cleanUrl}`;
  };

  const ActivityTable = ({ items, emptyMessage, icon: Icon }: { items: any[], emptyMessage: string, icon?: any }) => (
    <Table>
      <TableHeader className="bg-secondary/50">
        <TableRow>
          <TableHead className="w-16"></TableHead>
          <TableHead>Image ID</TableHead>
          <TableHead>Report ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((img: any) => (
          <TableRow key={img.id} className="border-border">
            <TableCell>
              <div className="w-8 h-8 rounded bg-background border border-border overflow-hidden">
                <AuthenticatedImage 
                  url={img.image_before} 
                  alt="Usage" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs text-primary">#{img.id}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {img.report?.id ? `#${img.report.id}` : '—'}
            </TableCell>
            <TableCell>
              {img.report ? (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  img.report.failureType === 'OCR_FAILURE' ? 'bg-orange-500/10 text-orange-500' : 
                  img.report.failureType === 'OTHER' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-red-500/10 text-red-500'
                }`}>
                  {img.report.failureType?.replace('_', ' ') || 'REPORTED'}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">No Issues</span>
              )}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(img.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Link to={img.report?.id ? `/admin/reports?id=${img.report.id}` : `/admin/images?id=${img.id}`}>
                <Button variant="ghost" size="sm" className="h-7 text-primary hover:bg-primary/10">Manage</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
              <div className="flex flex-col items-center gap-2 opacity-50">
                {Icon && <Icon className="w-8 h-8" />}
                <p className="italic">{emptyMessage}</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">User Administration</h1>
        <p className="text-muted-foreground">Manage specific platform accounts via their unique identifier.</p>
      </div>

      <Card className="bg-card border-border mb-8 shadow-sm">
        <CardHeader>
           <CardTitle className="text-lg flex items-center gap-2">
             <Search className="w-5 h-5 text-primary" />
             Identifier Lookup
           </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
             <Input 
               placeholder="Enter Numerical User ID (e.g. 3)" 
               value={userId}
               onChange={(e) => setUserId(e.target.value)}
               className="bg-background border-border text-foreground h-12"
             />
             <Button type="submit" disabled={loading} className="h-12 px-8">
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Activity'}
             </Button>
          </form>
        </CardContent>
      </Card>

      {userData && (
        <div className="space-y-6">
          <Card className="bg-card border-border border-l-4 border-l-primary shadow-sm overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 rounded-full bg-primary/10 text-primary">
                     <UserIcon className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-foreground">Account #{userId}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{userData.totalElements || 0} Reported Activity Records</span>
                      </div>
                   </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteUser}
                  className="bg-red-500 hover:bg-red-600 gap-2"
                >
                  <UserMinus className="w-4 h-4" />
                  Terminate Account
                </Button>
             </CardHeader>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
            <Tabs defaultValue="unresolved" className="w-full">
              <div className="px-6 pt-6 flex items-center justify-between border-b border-border">
                <TabsList className="bg-transparent border-b-0 h-auto p-0 gap-6">
                  <TabsTrigger 
                    value="unresolved" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-xs uppercase tracking-wider"
                  >
                    Unresolved ({unresolvedItems.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resolved" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-xs uppercase tracking-wider"
                  >
                    Resolved ({resolvedItems.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 font-semibold text-xs uppercase tracking-wider"
                  >
                    All Activity ({userData.content.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="unresolved" className="mt-0">
                <ActivityTable 
                  items={unresolvedItems} 
                  emptyMessage="No pending issues for this user." 
                  icon={CheckCircle2}
                />
              </TabsContent>

              <TabsContent value="resolved" className="mt-0">
                <ActivityTable 
                  items={resolvedItems} 
                  emptyMessage="No resolved history found." 
                  icon={Shield}
                />
              </TabsContent>

              <TabsContent value="all" className="mt-0">
                <ActivityTable 
                  items={userData.content} 
                  emptyMessage="This user hasn't uploaded any images yet." 
                  icon={FileText}
                />
              </TabsContent>
            </Tabs>
          </Card>

          {userData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                disabled={page === 0 || loading}
                onClick={() => handlePageChange(page - 1)}
                className="h-9 px-4"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Prev
              </Button>
              <span className="text-sm font-medium">Page {page + 1} of {userData.totalPages}</span>
              <Button
                variant="outline"
                disabled={page >= userData.totalPages - 1 || loading}
                onClick={() => handlePageChange(page + 1)}
                className="h-9 px-4"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
