import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllImages, deleteImage } from '../../api/adminApi';
import { deleteImage as deleteUserImage } from '../../api/userApi';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, ExternalLink, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedImage from '../../components/AuthenticatedImage';

export const AdminImages = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const size = 10;

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fixImage = (url: string) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Detect if it's a raw base64 string (no header)
    const isBase64 = url.length > 50 && !url.includes('.') && !url.includes(' ') && !url.includes('/');
    if (isBase64) {
      return `data:image/png;base64,${url}`;
    }
    
    // Clean potential double slashes
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `http://13.62.227.111:8080/${cleanPath}`;
  };

  const [totalPages, setTotalPages] = useState(1);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await getAllImages(page, size);
      console.log('Admin Images Raw Response:', res);
      
      // Handle res.data.content or res.content
      const root = res?.data || res;
      const content = root?.content || (Array.isArray(root) ? root : []);
      
      setImages(content);
      setTotalPages(root?.totalPages || Math.ceil((root?.totalElements || content.length) / size) || 1);
    } catch (error) {
      toast.error('Failed to fetch images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await deleteImage(id);
      toast.success('Image deleted');
      fetchImages();
    } catch (error: any) {
      toast.error('Delete failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Global Image Registry</h1>
        <p className="text-muted-foreground">Monitor all image translations across the entire platform.</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-16"></TableHead>
                <TableHead className="text-foreground">ID</TableHead>
                <TableHead className="text-foreground">User</TableHead>
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-right text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((img) => (
                <TableRow 
                  key={img.id} 
                  className={`border-border hover:bg-secondary/20 group transition-colors ${
                    String(img.id) === highlightId ? 'bg-primary/5 ring-1 ring-primary ring-inset' : ''
                  }`}
                >
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-background border border-border overflow-hidden">
                      <AuthenticatedImage 
                        url={img.image_before} 
                        alt="Thumb" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-[10px]">
                    {img.id}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {img.user?.username || img.username || 'user_'+(img.userId || img.user?.id || 'unknown')}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {img.createdAt ? new Date(img.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {img.image_after && (
                      <a href={img.image_after} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(img.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center gap-4 mt-8 pb-8">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="border-border text-primary hover:bg-primary/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <span className="text-muted-foreground">Page {page + 1} of {totalPages}</span>
        <Button
          variant="outline"
          disabled={page >= totalPages - 1 || loading}
          onClick={() => setPage(page + 1)}
          className="border-border text-primary hover:bg-primary/10"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
