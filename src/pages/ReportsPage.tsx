import React, { useState, useEffect } from 'react';
import { getUserReports, deleteReport, submitReport } from '../api/userApi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileWarning, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({ imageId: '', failureType: 'TRANSLATION_ERROR', description: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
  setLoading(true);

  try {
    const data = await getUserReports();

    const reportsData = data?.content ?? data?.data ?? [];

    setReports(Array.isArray(reportsData) ? reportsData : []);
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 404) {
      setReports([]); 
    } else {
      toast.error('Failed to fetch reports');
      console.error(error);
    }
  } finally {
    setLoading(false);
  }
};
  const handleDelete = async (id: number) => {
    try {
      await deleteReport(id);
      toast.success('Report deleted');
      fetchReports();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const imageId = parseInt(newReport.imageId);
  if (isNaN(imageId)) {
    toast.error('Please enter a valid Image ID');
    return;
  }
  
  try {
    await submitReport(imageId, {
      failureType: newReport.failureType,
      description: newReport.description
    });
    toast.success('Report submitted successfully');
    setIsDialogOpen(false);
    fetchReports();
  } catch (error) {
    toast.error('Failed to submit report. Ensure the image ID is valid.');
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Issue Reports</h1>
          <p className="text-muted-foreground">Track and manage reports you've submitted about translation failures.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle>Submit a New Issue</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Image ID</Label>
                <Input
                  required
                  placeholder="Enter the ID from your history"
                  value={newReport.imageId}
                  onChange={(e) => setNewReport({ ...newReport, imageId: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Select
                  value={newReport.failureType}
                  onValueChange={(val) => setNewReport({ ...newReport, failureType: val || 'TRANSLATION_ERROR' })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="TRANSLATION_ERROR">Translation Error</SelectItem>
                    <SelectItem value="IMAGE_CORRUPTION">Image Corruption</SelectItem>
                    <SelectItem value="OCR_FAILURE">OCR Failure</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  required
                  placeholder="Tell us what went wrong..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4 text-white">
                Submit Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Description</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="border-border hover:bg-secondary/20 transition-colors">
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {new Date(report.createdAt || Date.now()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {report.failureType?.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground max-w-xs truncate">
                    {report.description}
                  </TableCell>
                  <TableCell>
                    {report.resolved ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500 text-sm">
                        <Clock className="w-4 h-4" />
                        Pending
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(report.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
