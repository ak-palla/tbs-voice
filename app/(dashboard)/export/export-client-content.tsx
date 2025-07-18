"use client";

import React, { useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Printer, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Link as LinkIcon,
  Target,
  Users,
  Briefcase,
  Rocket,
  Cog,
  BookOpen,
  Flag,
  BarChart3,
  FileText,
  Settings,
  Calendar as CalendarIcon,
  ChevronDown,
  MapPin,
  Zap,
  TrendingUp,
  FileDown
} from "lucide-react";

interface UserData {
  businessInfo: any;
  additionalData: Record<string, any[]>;
}

interface ExportClientContentProps {
  user: User;
  userData: UserData;
}

// Helper function to format field names
const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Compact value formatter
const formatValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>;
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">None</span>;
      
      if (value.every(item => typeof item !== 'object' || item === null)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((item, index) => (
              <span key={index} className="inline-block bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                {String(item)}
              </span>
            ))}
            {value.length > 3 && (
              <span className="text-xs text-gray-500">+{value.length - 3}</span>
            )}
          </div>
        );
      }
      
      return <span className="text-xs text-gray-500">{value.length} items</span>;
    }
    
    if (value instanceof Date) {
      return <span>{value.toLocaleDateString()}</span>;
    }
    
    if (Object.keys(value).length === 0) return <span className="text-gray-400">Empty</span>;
    
    const keys = Object.keys(value);
    return <span className="text-xs text-gray-500">{keys.length} properties</span>;
  }
  
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex items-center gap-1 ${value ? 'text-emerald-600' : 'text-gray-400'}`}>
        {value ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        <span className="text-xs">{value ? 'Yes' : 'No'}</span>
      </span>
    );
  }
  
  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
    try {
      const date = new Date(value);
      return <span className="text-sm">{date.toLocaleDateString()}</span>;
    } catch (e) {
      return <span className="text-sm">{String(value)}</span>;
    }
  }
  
  if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 text-xs inline-flex items-center gap-1"
      >
        <LinkIcon className="h-3 w-3" />
        Link
      </a>
    );
  }
  
  if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
    return (
      <a 
        href={`mailto:${value}`}
        className="text-blue-600 hover:text-blue-700 text-sm"
      >
        {value}
      </a>
    );
  }
  
  if (typeof value === 'string' && value.length > 50) {
    return (
      <span className="text-sm" title={value}>
        {value.substring(0, 47)}...
      </span>
    );
  }
  
  return <span className="text-sm">{String(value)}</span>;
};

// Get icon for different table types
const getTableIcon = (table: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'battle_plan': <Target className="h-4 w-4 text-red-500" />,
    'chain_of_command': <Users className="h-4 w-4 text-blue-500" />,
    'company_onboarding': <Building2 className="h-4 w-4 text-purple-500" />,
    'hwgt_plan': <MapPin className="h-4 w-4 text-green-500" />,
    'machines': <Cog className="h-4 w-4 text-gray-500" />,
    'meeting_rhythm_planner': <CalendarIcon className="h-4 w-4 text-orange-500" />,
    'playbooks': <BookOpen className="h-4 w-4 text-indigo-500" />,
    'quarterly_sprint_canvas': <Flag className="h-4 w-4 text-yellow-500" />,
    'triage_planner': <Briefcase className="h-4 w-4 text-pink-500" />,
    'user_timeline_claims': <CheckCircle className="h-4 w-4 text-emerald-500" />,
    'chq_timeline': <Calendar className="h-4 w-4 text-blue-500" />
  };
  
  return iconMap[table] || <FileText className="h-4 w-4 text-gray-400" />;
};

// Compact info row
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) => (
  <div className="flex items-center justify-between text-sm py-1.5">
    <div className="flex items-center gap-2 text-gray-600 min-w-0">
      <span className="text-gray-400">{icon}</span>
      <span className="font-medium truncate">{label}</span>
    </div>
    <div className="text-right ml-3 min-w-0 flex-shrink-0">
      {formatValue(value)}
    </div>
  </div>
);

// Status indicator
const StatusDot = ({ status, label }: { status: boolean; label: string }) => (
  <div className="flex items-center gap-2 text-xs">
    <div className={`w-2 h-2 rounded-full ${status ? 'bg-emerald-500' : 'bg-gray-300'}`} />
    <span className={status ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
  </div>
);

export function ExportClientContent({ user, userData }: ExportClientContentProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePrint = () => window.print();

  const handleExportJSON = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      ...userData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Temporarily expand all sections for PDF
      const allTables = relevantTables.filter(table => {
        const data = userData.additionalData[table];
        return data && data.length > 0;
      });
      
      const tempExpandedState: Record<string, boolean> = {};
      allTables.forEach(table => {
        tempExpandedState[table] = true;
      });
      setExpandedSections(tempExpandedState);
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate filename
      const businessName = userData.businessInfo?.business_name || 'Business';
      const filename = `${businessName.replace(/[^a-zA-Z0-9]/g, '_')}_Data_Export_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // PDF options
      const options = {
        margin: [10, 10, 10, 10],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      // Generate and download PDF
      await html2pdf().set(options).from(exportRef.current).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      // Reset expanded sections to original state
      setExpandedSections({});
    }
  };

  const relevantTables = [
    'battle_plan', 'chain_of_command', 'hwgt_plan', 'quarterly_sprint_canvas',
    'triage_planner', 'machines', 'meeting_rhythm_planner', 'playbooks',
    'company_onboarding', 'user_timeline_claims'
  ];

  const dataStats = relevantTables.reduce((acc, table) => {
    const data = userData.additionalData[table];
    if (data && data.length > 0) acc.push({ table, count: data.length });
    return acc;
  }, [] as Array<{ table: string; count: number }>);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
          <p className="text-sm text-gray-500">
            {dataStats.length} data types • {dataStats.reduce((sum, item) => sum + item.count, 0)} total records
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF} 
            disabled={isGeneratingPDF}
            className="h-8 px-3 text-xs"
          >
            <FileDown className="h-3 w-3 mr-1" />
            {isGeneratingPDF ? 'Generating...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportJSON} className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 px-3 text-xs">
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
        </div>
      </div>

      {/* Export Content */}
      <div ref={exportRef} className="space-y-4">
        {/* PDF Header (only visible in PDF) */}
        <div className="hidden print:block pdf-header">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Data Report</h1>
            <p className="text-lg text-gray-600">
              {userData.businessInfo?.business_name || 'Business Export'} • Generated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Business Overview Sidebar */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-slate-600" />
                  <h2 className="font-semibold text-slate-900">Business</h2>
                </div>
                
                {userData.businessInfo ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-lg font-bold text-slate-900 truncate">
                        {userData.businessInfo.business_name || 'Unnamed Business'}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {userData.businessInfo.full_name || 'No owner name'}
                      </div>
                    </div>
                    
                    <div className="pt-2 space-y-1">
                      <StatusDot status={userData.businessInfo.command_hq_created} label="Command HQ" />
                      <StatusDot status={userData.businessInfo.gd_folder_created} label="Google Drive" />
                      <StatusDot status={userData.businessInfo.meeting_scheduled} label="Initial Meeting" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs">No business data</p>
                  </div>
                )}
              </div>
              
              {userData.businessInfo && (
                <div className="p-4 space-y-2">
                  <InfoRow 
                    icon={<Mail className="h-3 w-3" />} 
                    label="Email" 
                    value={userData.businessInfo.email} 
                  />
                  <InfoRow 
                    icon={<Phone className="h-3 w-3" />} 
                    label="Phone" 
                    value={userData.businessInfo.phone_number} 
                  />
                  <InfoRow 
                    icon={<CreditCard className="h-3 w-3" />} 
                    label="Plan" 
                    value={userData.businessInfo.payment_option} 
                  />
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="mt-4">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium text-gray-900">Quick Stats</h3>
                </div>
                
                <div className="space-y-2">
                  {dataStats.slice(0, 4).map(({ table, count }) => (
                    <div key={table} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getTableIcon(table)}
                        <span className="text-gray-600 truncate">{formatFieldName(table)}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                  {dataStats.length > 4 && (
                    <div className="text-xs text-gray-500 pt-1">
                      +{dataStats.length - 4} more types
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {relevantTables.map(table => {
                const data = userData.additionalData[table];
                if (!data || data.length === 0) return null;

                const isExpanded = expandedSections[table];
                const tableDisplayName = formatFieldName(table);
                
                return (
                  <Card key={table} className="overflow-hidden">
                    <div 
                      className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors print:cursor-default"
                      onClick={() => toggleSection(table)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTableIcon(table)}
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{tableDisplayName}</h3>
                            <p className="text-xs text-gray-500">{data.length} record{data.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform print:hidden ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t bg-gray-50/50">
                        {data.slice(0, 2).map((record: any, index: number) => (
                          <div key={record.id || index} className="p-4 border-b border-gray-100 last:border-b-0">
                            {data.length > 1 && (
                              <div className="text-xs font-medium text-gray-500 mb-2">
                                Record {index + 1}
                                {record.created_at && (
                                  <span className="ml-2 text-gray-400">
                                    • {formatValue(record.created_at)}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="space-y-1">
                              {Object.entries(record)
                                .filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
                                .slice(0, 4)
                                .map(([key, value]) => (
                                  <InfoRow 
                                    key={key} 
                                    icon={<div className="w-2 h-2 bg-gray-300 rounded-full" />}
                                    label={formatFieldName(key)} 
                                    value={value}
                                  />
                                ))}
                              
                              {Object.keys(record).filter(key => !['id', 'user_id', 'created_at', 'updated_at'].includes(key)).length > 4 && (
                                <div className="text-xs text-gray-500 pt-1">
                                  +{Object.keys(record).filter(key => !['id', 'user_id', 'created_at', 'updated_at'].includes(key)).length - 4} more fields
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {data.length > 2 && (
                          <div className="p-3 text-center text-xs text-gray-500 bg-gray-50">
                            +{data.length - 2} more records
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Print/PDF styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:cursor-default { cursor: default !important; }
          body { -webkit-print-color-adjust: exact; }
          
          .pdf-header {
            page-break-after: avoid;
          }
          
          .grid {
            break-inside: avoid;
          }
        }
        
        /* PDF-specific styles */
        .pdf-export {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
} 