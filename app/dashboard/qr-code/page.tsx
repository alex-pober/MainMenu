"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/use-supabase';
import { Download, Copy, Share } from 'lucide-react';

export default function QRCodePage() {
  const [publicUrl, setPublicUrl] = useState('');
  const { toast } = useToast();
  const { client: supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        const url = `https://${window.location.host}/menus/${user.id}`;
        setPublicUrl(url);
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user, toast]);

  const handleDownload = async () => {
    try {
      // Generate SVG string
      const svgString = await QRCode.toString(publicUrl, {
        type: 'svg',
        margin: 4,
        width: 256,
        errorCorrectionLevel: 'H'
      });

      // Add XML declaration and DOCTYPE
      const fullSvgString = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${svgString}`;

      // Create a Blob from the SVG data
      const blob = new Blob([fullSvgString], { type: 'image/svg+xml;charset=utf-8' });
      
      // Create a download link
      const link = document.createElement('a');
      link.download = 'menu-qr-code.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(link.href);

      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Restaurant Menu',
          text: 'Check out our menu!',
          url: publicUrl,
        });
      } else {
        throw new Error('Share functionality not supported');
      }
    } catch (error) {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-8">QR Code</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu QR Code</CardTitle>
            <CardDescription>Share your menu with customers using this QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG 
                  value={publicUrl}
                  size={256}
                  level="H"
                  includeMargin
                  className="w-full h-full"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
              <div className="flex flex-col sm:flex-row w-full gap-2">
                <Button 
                  onClick={handleDownload}
                  className="w-full sm:flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  className="w-full sm:flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="w-full sm:flex-1"
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Public Menu URL</label>
              <div className="flex gap-2 mt-1">
                <Input value={publicUrl} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
