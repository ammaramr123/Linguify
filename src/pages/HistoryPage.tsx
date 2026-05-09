import React, { useState, useEffect } from 'react';
import { getHistory, deleteImage } from '../api/userApi';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Trash2, Calendar, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import AuthenticatedImage from '../components/AuthenticatedImage';

export const HistoryPage = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const size = 6;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
  setLoading(true);
  try {
    const data = await getHistory(page, size);
    const items = data.content || data;
    console.log('items[0]:', items[0]); // ✅ هنا مش بعد setHistory
    setHistory(items);
  } catch (error) {
    toast.error('Failed to fetch history');
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this translation?')) return;
    try {
      await deleteImage(id);
      toast.success('Record deleted');
      fetchHistory();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Translation History</h1>
          <p className="text-muted-foreground">Review and manage your past image translations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {history.length > 0 ? (
          history.map((record) => (
            <Card key={record.id} className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 ">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-foreground uppercase text-[10px] font-bold tracking-wider">
                      {record.targetLang}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">ID: {record.id}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 bg-border gap-px">
                  <div className="relative group">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white z-10 backdrop-blur-sm uppercase">Original</div>
                    <div className="aspect-video bg-background overflow-hidden">
                      <AuthenticatedImage url={record.image_before} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute top-2 left-2 px-2 py-1 bg-primary/60 rounded text-[10px] font-bold text-white z-10 backdrop-blur-sm uppercase">Translated</div>
                    <div className="aspect-video bg-background overflow-hidden">
                      <AuthenticatedImage url={record.image_after} alt="Translated" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          !loading && (
            <div className="text-center py-20 bg-card/30 border-2 border-dashed border-border rounded-2xl">
              <ImageIcon className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-muted-foreground italic">No history found. Start by translating your first image!</p>
            </div>
          )
        )}
      </div>

      <div className="flex justify-center items-center gap-4 mt-12 pb-12">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="border-border text-primary hover:bg-primary/10"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <span className="text-muted-foreground font-medium">Page {page + 1}</span>
        <Button
          variant="outline"
          disabled={history.length < size}
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
