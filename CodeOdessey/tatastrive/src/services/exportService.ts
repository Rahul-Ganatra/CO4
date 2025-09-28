import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { BusinessPlan } from '@/types/mentor';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'txt';
  includeFeedback: boolean;
  includeMetrics: boolean;
  includeSections: boolean;
}

export class ExportService {
  static async exportBusinessPlan(
    plan: BusinessPlan, 
    options: ExportOptions = {
      format: 'pdf',
      includeFeedback: true,
      includeMetrics: true,
      includeSections: true
    }
  ): Promise<void> {
    switch (options.format) {
      case 'pdf':
        await this.exportToPDF(plan, options);
        break;
      case 'docx':
        await this.exportToWord(plan, options);
        break;
      case 'txt':
        await this.exportToText(plan, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static async exportToPDF(plan: BusinessPlan, options: ExportOptions): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition + fontSize > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize + 2;
      });
    };

    // Helper function to add a section header
    const addSectionHeader = (title: string) => {
      if (yPosition + 20 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      addText(title, 16, true);
      yPosition += 5;
    };

    // Title
    addText(plan.title, 20, true);
    yPosition += 10;

    // Basic Information
    addText(`Entrepreneur: ${plan.entrepreneur}`, 12);
    addText(`Region: ${plan.region}`, 12);
    addText(`Sector: ${plan.sector}`, 12);
    addText(`Status: ${plan.status.replace('_', ' ').toUpperCase()}`, 12);
    addText(`Quality Score: ${plan.qualityScore}/100`, 12);
    addText(`Completion: ${plan.completionPercentage}%`, 12);
    addText(`Priority: ${plan.priority.toUpperCase()}`, 12);
    addText(`Submitted: ${plan.submissionDate.toLocaleDateString()}`, 12);
    yPosition += 10;

    // Summary
    addSectionHeader('Executive Summary');
    addText(plan.summary, 12);
    yPosition += 10;

    // Business Plan Sections
    if (options.includeSections && plan.sections) {
      addSectionHeader('Business Plan Details');
      
      if (plan.sections.problem) {
        addText('Problem Statement:', 14, true);
        addText(plan.sections.problem, 12);
        yPosition += 5;
      }
      
      if (plan.sections.solution) {
        addText('Solution:', 14, true);
        addText(plan.sections.solution, 12);
        yPosition += 5;
      }
      
      if (plan.sections.customer) {
        addText('Target Customer:', 14, true);
        addText(plan.sections.customer, 12);
        yPosition += 5;
      }
      
      if (plan.sections.revenue) {
        addText('Revenue Model:', 14, true);
        addText(plan.sections.revenue, 12);
        yPosition += 5;
      }
      
      if (plan.sections.risks) {
        addText('Risk Assessment:', 14, true);
        addText(plan.sections.risks, 12);
        yPosition += 5;
      }
    }

    // Strengths
    if (plan.strengths.length > 0) {
      addSectionHeader('Key Strengths');
      plan.strengths.forEach((strength, index) => {
        addText(`${index + 1}. ${strength}`, 12);
      });
      yPosition += 5;
    }

    // Areas for Improvement
    if (plan.areasForImprovement.length > 0) {
      addSectionHeader('Areas for Improvement');
      plan.areasForImprovement.forEach((area, index) => {
        addText(`${index + 1}. ${area}`, 12);
      });
      yPosition += 5;
    }

    // AI Feedback
    if (options.includeFeedback && plan.feedback?.ai && plan.feedback.ai.length > 0) {
      addSectionHeader('AI Feedback');
      plan.feedback.ai.forEach((feedback, index) => {
        addText(`${index + 1}. ${feedback}`, 12);
      });
      yPosition += 5;
    }

    // Mentor Feedback
    if (options.includeFeedback && plan.feedback?.mentor && plan.feedback.mentor.length > 0) {
      addSectionHeader('Mentor Feedback');
      plan.feedback.mentor.forEach((feedback, index) => {
        addText(`${index + 1}. ${feedback}`, 12);
      });
      yPosition += 5;
    }

    // Metrics
    if (options.includeMetrics && plan.metrics) {
      addSectionHeader('Metrics');
      addText(`Time Spent: ${Math.floor(plan.metrics.timeSpent / 60)}h ${plan.metrics.timeSpent % 60}m`, 12);
      addText(`Revisions: ${plan.metrics.revisions}`, 12);
      addText(`Last Updated: ${plan.metrics.lastUpdated.toLocaleDateString()}`, 12);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by TataStrive Platform`,
        pageWidth - 100,
        pageHeight - 10
      );
    }

    // Save the PDF
    const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_plan.pdf`;
    doc.save(fileName);
  }

  private static async exportToWord(plan: BusinessPlan, options: ExportOptions): Promise<void> {
    // For now, we'll create a simple text-based export
    // In a real implementation, you'd use a library like docx
    const content = this.generateTextContent(plan, options);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_plan.docx`;
    saveAs(blob, fileName);
  }

  private static async exportToText(plan: BusinessPlan, options: ExportOptions): Promise<void> {
    const content = this.generateTextContent(plan, options);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileName = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_business_plan.txt`;
    saveAs(blob, fileName);
  }

  private static generateTextContent(plan: BusinessPlan, options: ExportOptions): string {
    let content = '';
    
    // Title
    content += `${plan.title}\n`;
    content += '='.repeat(plan.title.length) + '\n\n';
    
    // Basic Information
    content += 'BASIC INFORMATION\n';
    content += '-'.repeat(20) + '\n';
    content += `Entrepreneur: ${plan.entrepreneur}\n`;
    content += `Region: ${plan.region}\n`;
    content += `Sector: ${plan.sector}\n`;
    content += `Status: ${plan.status.replace('_', ' ').toUpperCase()}\n`;
    content += `Quality Score: ${plan.qualityScore}/100\n`;
    content += `Completion: ${plan.completionPercentage}%\n`;
    content += `Priority: ${plan.priority.toUpperCase()}\n`;
    content += `Submitted: ${plan.submissionDate.toLocaleDateString()}\n\n`;
    
    // Summary
    content += 'EXECUTIVE SUMMARY\n';
    content += '-'.repeat(20) + '\n';
    content += `${plan.summary}\n\n`;
    
    // Business Plan Sections
    if (options.includeSections && plan.sections) {
      content += 'BUSINESS PLAN DETAILS\n';
      content += '-'.repeat(25) + '\n';
      
      if (plan.sections.problem) {
        content += 'Problem Statement:\n';
        content += `${plan.sections.problem}\n\n`;
      }
      
      if (plan.sections.solution) {
        content += 'Solution:\n';
        content += `${plan.sections.solution}\n\n`;
      }
      
      if (plan.sections.customer) {
        content += 'Target Customer:\n';
        content += `${plan.sections.customer}\n\n`;
      }
      
      if (plan.sections.revenue) {
        content += 'Revenue Model:\n';
        content += `${plan.sections.revenue}\n\n`;
      }
      
      if (plan.sections.risks) {
        content += 'Risk Assessment:\n';
        content += `${plan.sections.risks}\n\n`;
      }
    }
    
    // Strengths
    if (plan.strengths.length > 0) {
      content += 'KEY STRENGTHS\n';
      content += '-'.repeat(15) + '\n';
      plan.strengths.forEach((strength, index) => {
        content += `${index + 1}. ${strength}\n`;
      });
      content += '\n';
    }
    
    // Areas for Improvement
    if (plan.areasForImprovement.length > 0) {
      content += 'AREAS FOR IMPROVEMENT\n';
      content += '-'.repeat(25) + '\n';
      plan.areasForImprovement.forEach((area, index) => {
        content += `${index + 1}. ${area}\n`;
      });
      content += '\n';
    }
    
    // AI Feedback
    if (options.includeFeedback && plan.feedback?.ai && plan.feedback.ai.length > 0) {
      content += 'AI FEEDBACK\n';
      content += '-'.repeat(15) + '\n';
      plan.feedback.ai.forEach((feedback, index) => {
        content += `${index + 1}. ${feedback}\n`;
      });
      content += '\n';
    }
    
    // Mentor Feedback
    if (options.includeFeedback && plan.feedback?.mentor && plan.feedback.mentor.length > 0) {
      content += 'MENTOR FEEDBACK\n';
      content += '-'.repeat(17) + '\n';
      plan.feedback.mentor.forEach((feedback, index) => {
        content += `${index + 1}. ${feedback}\n`;
      });
      content += '\n';
    }
    
    // Metrics
    if (options.includeMetrics && plan.metrics) {
      content += 'METRICS\n';
      content += '-'.repeat(8) + '\n';
      content += `Time Spent: ${Math.floor(plan.metrics.timeSpent / 60)}h ${plan.metrics.timeSpent % 60}m\n`;
      content += `Revisions: ${plan.metrics.revisions}\n`;
      content += `Last Updated: ${plan.metrics.lastUpdated.toLocaleDateString()}\n\n`;
    }
    
    content += 'Generated by TataStrive Platform\n';
    content += `Export Date: ${new Date().toLocaleDateString()}\n`;
    
    return content;
  }

  static async exportMultiplePlans(plans: BusinessPlan[], options: ExportOptions): Promise<void> {
    // Export each plan individually
    for (const plan of plans) {
      await this.exportBusinessPlan(plan, options);
    }
  }
}
