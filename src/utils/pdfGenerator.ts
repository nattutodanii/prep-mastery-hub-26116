import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFGeneratorProps {
  title: string;
  content: Record<string, string>;
  type: 'exam' | 'course';
}

export const generatePDF = async ({ title, content, type }: PDFGeneratorProps) => {
  // Create a temporary div to render content for PDF
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '40px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  tempDiv.style.fontSize = '14px';
  tempDiv.style.lineHeight = '1.6';
  tempDiv.style.color = '#000000';
  
  // Build HTML content
  let htmlContent = `
    <div style="margin-bottom: 40px; text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
      <h1 style="font-size: 28px; font-weight: bold; color: #1e40af; margin: 0;">${title}</h1>
      <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 16px;">Complete ${type === 'exam' ? 'Exam' : 'Course'} Guide</p>
    </div>
  `;

  // Add content sections
  Object.entries(content).forEach(([key, value]) => {
    if (value && value.trim()) {
      const sectionTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      htmlContent += `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">${sectionTitle}</h2>
          <div style="color: #374151; white-space: pre-wrap;">${formatContentForPDF(value)}</div>
        </div>
      `;
    }
  });

  // Add social media links section
  htmlContent += `
    <div style="margin-top: 50px; padding-top: 30px; border-top: 3px solid #3b82f6; text-align: center;">
      <h2 style="font-size: 22px; font-weight: bold; color: #1e40af; margin-bottom: 25px;">Join Our Community</h2>
      <div style="display: flex; justify-content: center; gap: 40px; align-items: center; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="width: 60px; height: 60px; background-color: #25d366; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">W</span>
          </div>
          <p style="margin: 0; font-weight: bold; color: #374151;">WhatsApp Channel</p>
          <a href="https://whatsapp.com/channel/0029Vb6R8rnFy72GVylkk41z" style="color: #3b82f6; text-decoration: none; font-size: 12px; word-break: break-all;">Join Now</a>
        </div>
        <div style="text-align: center;">
          <div style="width: 60px; height: 60px; background-color: #0088cc; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">T</span>
          </div>
          <p style="margin: 0; font-weight: bold; color: #374151;">Telegram Channel</p>
          <a href="https://t.me/mastersupofficial" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Join Now</a>
        </div>
      </div>
      <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Get instant updates, study materials, and connect with thousands of aspirants preparing for their dream masters programs!
        </p>
      </div>
    </div>
    
    <div style="margin-top: 40px; text-align: center; padding: 20px; background-color: #1e40af; color: white; border-radius: 10px;">
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Start Your Preparation Today!</h3>
      <p style="margin: 0; font-size: 14px;">Visit MastersUp.in for comprehensive study materials and practice tests</p>
      <p style="margin: 10px 0 0 0; font-weight: bold; font-size: 16px;">🚀 Your Gateway to Dream Masters Programs</p>
    </div>
  `;

  tempDiv.innerHTML = htmlContent;
  document.body.appendChild(tempDiv);

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Download PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_guide.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

const formatContentForPDF = (content: string): string => {
  // Clean up content and format for PDF
  let formatted = content
    .replace(/\{[^}]*supabase[^}]*\}/gi, '') // Remove supabase references
    .replace(/\[object Object\]/g, '') // Remove object references
    .replace(/undefined/g, '') // Remove undefined values
    .replace(/null/g, '') // Remove null values
    .trim();

  // Convert markdown-like formatting to HTML
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>') // Code
    .replace(/#{3}\s*(.*)/g, '<h3 style="font-size: 16px; font-weight: bold; color: #1e40af; margin: 20px 0 10px 0;">$1</h3>') // H3
    .replace(/#{2}\s*(.*)/g, '<h2 style="font-size: 18px; font-weight: bold; color: #1e40af; margin: 25px 0 15px 0;">$1</h2>') // H2
    .replace(/#{1}\s*(.*)/g, '<h1 style="font-size: 20px; font-weight: bold; color: #1e40af; margin: 30px 0 20px 0;">$1</h1>') // H1
    .replace(/\n\s*\n/g, '</p><p style="margin: 10px 0;">') // Paragraphs
    .replace(/^\s*[\*\-\+]\s(.+)/gm, '<li style="margin: 5px 0;">$1</li>'); // List items

  // Wrap in paragraph if no HTML tags
  if (!formatted.includes('<')) {
    formatted = `<p style="margin: 10px 0;">${formatted}</p>`;
  }

  return formatted;
};