import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Loader2, AlertCircle } from 'lucide-react';

interface AuthenticatedImageProps {
  url: string;
  alt?: string;
  className?: string;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ url, alt, className }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fixUrl = (u: string) => {
  if (!u) return '';
  if (u.startsWith('http') || u.startsWith('data:')) return u;

  const isBase64 = u.length > 100 && /^[A-Za-z0-9+/=]+$/.test(u.replace(/\s/g, ''));
  if (isBase64) {
    return `data:image/png;base64,${u}`;
  }

  return u.startsWith('/') ? u : `/${u}`;
};

useEffect(() => {
  let blobUrl: string | null = null;

  const fetchImage = async () => {
    const fixedUrl = fixUrl(url);

    if (
      fixedUrl.startsWith('http://') ||
      fixedUrl.startsWith('https://') ||
      fixedUrl.startsWith('data:')
    ) {
      setSrc(fixedUrl);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await axiosInstance.get(fixedUrl, {
        responseType: 'blob',
      });

      blobUrl = URL.createObjectURL(response.data);
      setSrc(blobUrl);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (url) fetchImage();

  return () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  };
}, [url]);
  if (!url) return <div className={className} />;
  
  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-secondary/20`}>
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-500/5 border border-red-500/20`}>
        <AlertCircle className="w-4 h-4 text-red-500" />
      </div>
    );
  }

  return <img src={src || ''} alt={alt} className={className} referrerPolicy="no-referrer" />;
};

export default AuthenticatedImage;
