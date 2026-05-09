import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getUnresolvedReports, getResolvedReports, deleteImage } from '../../api/adminApi';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { AlertCircle, CheckCircle2, MoreHorizontal, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedImage from '../../components/AuthenticatedImage';

export const AdminReports = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [unresolved, setUnresolved] = useState<any[]>([]);
  const [resolved, setResolved] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unresolved');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        getUnresolvedReports(),
        getResolvedReports()
      ]);

      const rootU = uRes?.data || uRes;
      const rootR = rRes?.data || rRes;

      const unresolvedData = rootU?.content || (Array.isArray(rootU) ? rootU : []);
      const resolvedData = rootR?.content || (Array.isArray(rootR) ? rootR : []);

      setUnresolved(unresolvedData);
      setResolved(resolvedData);

      if (highlightId) {
        const isResolved = resolvedData.some((item: any) => String(item.report?.id) === highlightId);
        if (isResolved) {
          setActiveTab('resolved');
        }
      }
    } catch (e: any) {
      console.error("Failed to fetch reports:", e);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: any) => {
    if (!window.confirm('Delete the offending image?')) return;
    try {
      await deleteImage(imageId);
      toast.success('Image deleted');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const fixImage = (url: string) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Detect if it's a raw base64 string (no header)
    const isBase64 = url.length > 50 && !url.includes('.') && !url.includes(' ') && !url.includes('/');
    if (isBase64) {
      return `data:image/png;base64,${url}`;
    }

    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `http://13.62.227.111:8080/${cleanPath}`;
  };

  const ReportTable = ({ data, isResolved }: { data: any[], isResolved: boolean }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow className="border-border">
              <TableHead className="w-16"></TableHead>
              <TableHead className="text-foreground">Reporter</TableHead>
              <TableHead className="text-foreground">Issue Type</TableHead>
              <TableHead className="text-foreground">Description</TableHead>
              <TableHead className="text-foreground">Image ID</TableHead>
              <TableHead className="text-right text-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, idx) => {
              const report = item.report || {};
              const imageId = item.id || report.imageId || 'N/A';
              const reportId = report.id || (imageId !== 'N/A' ? `rep-${imageId}` : `temp-${idx}`);
              const failureType = report.failureType || 'UNKNOWN';
              const description = report.description || 'No description provided';
              const reportDate = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'UnknownDate');

              return (
                <TableRow
                  key={reportId}
                  className={`border-border hover:bg-secondary/20 transition-colors ${String(report.id) === highlightId ? 'bg-primary/5 ring-1 ring-primary ring-inset' : ''
                    }`}
                >
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-background border border-border overflow-hidden">
                      <AuthenticatedImage
                        url={item.image_before}
                        alt="Issue"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-primary" />
                        <span className="font-medium">
                          {report.username || item.username || (item.user?.username) || 'Reporter #' + (item.userId || item.user?.id || 'System')}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-5">{reportDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${failureType === 'OCR_FAILURE' ? 'bg-orange-500/20 text-orange-400' :
                        failureType === 'OTHER' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                      }`}>
                      {failureType.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate" title={description}>
                    {description}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <span>Image #{imageId}</span>
                      {item.image_after && (
                        <a
                          href={item.image_after}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline text-[9px]"
                        >
                          View Result
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isResolved ? (
                        <div className="flex items-center justify-end gap-1 text-emerald-500">
                          <span className="text-[10px] font-medium">Done</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Pending</span>
                      )}
                      {imageId !== 'N/A' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                          onClick={() => handleDeleteImage(imageId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                  No {isResolved ? 'resolved' : 'pending'} reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <AlertCircle className="text-primary" />
          Report Center
        </h1>
        <p className="text-muted-foreground">Prioritize and resolve user reported issues.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary border border-border p-1 mb-6 flex flex-row w-fit">
          <TabsTrigger value="unresolved" className="data-[state=active]:bg-primary text-sm">
            Pending Approval
          </TabsTrigger>
          <TabsTrigger value="resolved" className="data-[state=active]:bg-primary text-sm">
            Archived/Resolved
          </TabsTrigger>
        </TabsList>
        <TabsContent value="unresolved">
          <ReportTable data={unresolved} isResolved={false} />
        </TabsContent>
        <TabsContent value="resolved">
          <ReportTable data={resolved} isResolved={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
