'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import jsPDF from 'jspdf';

interface MenuData {
  profile: any;
  menus: any[];
}

export default function PrintMenu() {
  const supabase = createClient();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('Error fetching user:', error);
        return;
      }
      if (user) {
        setUserId(user.id);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!userId) {
        console.log('No user ID found');
        return;
      }

      try {
        const [profileResponse, menusResponse] = await Promise.all([
          supabase
            .from('restaurant_profiles')
            .select('*')
            .eq('user_id', userId)
            .single(),
          supabase
            .from('menus')
            .select(`
              id,
              user_id,
              name,
              description,
              status,
              display_order,
              is_always_available,
              available_start_time,
              available_end_time,
              created_at,
              updated_at,
              menu_categories (
                id,
                menu_id,
                name,
                description,
                sort_order,
                created_at,
                updated_at,
                menu_items (
                  id,
                  category_id,
                  name,
                  description,
                  price,
                  image_urls,
                  addons,
                  is_available,
                  is_spicy,
                  is_new,
                  is_limited_time,
                  is_most_popular,
                  is_special,
                  is_vegan,
                  is_vegetarian,
                  sort_order,
                  created_at,
                  updated_at
                )
              )
            `)
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('display_order', { ascending: true })
        ]);

        if (profileResponse.error) {
          console.log('Error fetching restaurant profile:', profileResponse.error);
          throw profileResponse.error;
        }

        if (menusResponse.error) {
          console.log('Error fetching menu data:', menusResponse.error);
          throw menusResponse.error;
        }

        const data = {
          profile: profileResponse.data,
          menus: menusResponse.data
        };
        console.log(data)
        setMenuData(data);
        generatePDF(data);
      } catch (error) {
        console.log('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  const generatePDF = (data: MenuData) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set initial position
    let y = 40; // Start a bit lower from the top
    const margin = 30; // Increased margin for elegance
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    const centerX = pageWidth / 2;

    // Helper function to check and add new page if needed
    const checkNewPage = (requiredSpace: number = 40) => {
      if (y + requiredSpace >= (pageHeight + margin)) {
        pdf.addPage();
        y = 40; // Reset to top of new page with margin
        return true;
      }
      return false;
    };

    // Helper function to add centered text
    const addCenteredText = (text: string, y: number, fontSize: number, fontStyle: string = 'normal') => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      const textWidth = pdf.getStringUnitWidth(text) * fontSize / pdf.internal.scaleFactor;
      pdf.text(text, centerX - (textWidth / 2), y);
      return fontSize * 1.5; // Return height used
    };

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, align: 'left' | 'center' = 'left') => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      if (align === 'center') {
        lines.forEach((line: string) => {
          const textWidth = pdf.getStringUnitWidth(line) * fontSize / pdf.internal.scaleFactor;
          pdf.text(line, centerX - (textWidth / 2), y);
          y += fontSize * 0.5;
        });
      } else {
        pdf.text(lines, x, y);
      }
      return lines.length * fontSize * 0.5;
    };

    // Add restaurant name with larger, bold font
    pdf.setFont('helvetica', 'bold');
    y += addCenteredText(data.profile.name.toUpperCase(), y, 32, 'bold');
    y += 10;

    // Add decorative line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 15;

    // Add restaurant description if available
    if (data.profile.description) {
      pdf.setFont('helvetica', 'italic');
      y += addWrappedText(data.profile.description, margin, y, contentWidth, 12, 'center');
      y += 20;
    }

    // Process each menu
    data.menus.forEach((menu) => {
      checkNewPage(60); // Check if we need a new page for menu title

      // Add menu name
      y += addCenteredText(menu.name.toUpperCase(), y, 24, 'bold');
      y += 5;

      // Process each category
      menu.menu_categories?.sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((category: any) => {
        checkNewPage(50); // Check if we need a new page for category

        // Add category name with decorative elements
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        const catText = category.name.toUpperCase();
        const catWidth = pdf.getStringUnitWidth(catText) * 18 / pdf.internal.scaleFactor;
        
        // Draw decorative lines around category
        const lineLength = 50;
        pdf.line(centerX - (catWidth / 2) - lineLength, y, centerX - (catWidth / 2) - 10, y);
        pdf.line(centerX + (catWidth / 2) + 10, y, centerX + (catWidth / 2) + lineLength, y);
        
        y += addCenteredText(catText, y, 18, 'bold');
        y -= 10;

        // Process items in category
        category.menu_items?.sort((a: any, b: any) => a.sort_order - b.sort_order).forEach((item: any) => {
          // Calculate required space for this item
          const requiredSpace = item.description ? 60 : 30;
          checkNewPage(requiredSpace);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);

          // Create item text with dots between name and price
          const itemName = item.name;
          const itemPrice = item.price !== null ? `$${item.price.toFixed(2)}` : '';
          const nameWidth = pdf.getStringUnitWidth(itemName) * 12 / pdf.internal.scaleFactor;
          const priceWidth = pdf.getStringUnitWidth(itemPrice) * 12 / pdf.internal.scaleFactor;
          
          // Add item name
          pdf.text(itemName, margin, y);
          
          // Add price aligned to the right
          if (itemPrice) {
            pdf.text(itemPrice, pageWidth - margin - priceWidth, y);
            
            // Add dots between name and price
            const dotsStart = margin + nameWidth + 5;
            const dotsEnd = pageWidth - margin - priceWidth - 5;
            if (dotsEnd > dotsStart) {
              pdf.setFontSize(8);
              let dotX = dotsStart;
              while (dotX < dotsEnd) {
                pdf.text('.', dotX, y - 1);
                dotX += 3;
              }
            }
          }
          
          y += 5;

          // Add item description if available
          if (item.description) {
            checkNewPage(30);
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(10);
            y += addWrappedText(item.description, margin + 10, y, contentWidth - 20, 10) - 5;
            y += 10;
          }
        });

        y += 15; // Space after category
      });

      y += 15; // Space after menu
    });

    // Generate PDF URL
    const pdfBlob = pdf.output('bloburl');
    setPdfUrl(pdfBlob.toString());
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!menuData) {
    return <div className="flex justify-center items-center min-h-screen">No menu data found</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Print Menu Preview</h1>
      </div>

      {pdfUrl && (
        <div className="w-full aspect-[1/1.4142] border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="Menu PDF Preview"
          />
        </div>
      )}
    </div>
  );
}
