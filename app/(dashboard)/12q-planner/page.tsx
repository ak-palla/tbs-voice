"use client";

import { useState, useEffect } from 'react';
import { Loader2, Save, Calculator, TrendingUp, DollarSign, Edit, Target, BarChart3, Info } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getTeamId } from '@/utils/supabase/teams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// Type definitions
type QuarterPlanningData = {
  id?: string;
  team_id: string;
  y1_sales: number | null;
  y1_profit: number | null;
  target_sales: number | null;
  target_profit: number | null;
  straight_line_data?: Record<string, { sales: number; profit: number; margin: number }>;
  actual_data?: Record<string, { sales: number; profit: number; margin: number }>;
};

type QuarterData = {
  quarter: string;
  straight_line_sales: number;
  straight_line_profit: number;
  straight_line_margin: number;
  actual_sales: number | null;
  actual_profit: number | null;
  actual_margin: number | null;
};

type EditingCells = {
  [key: string]: string; // key format: "quarter-field", value is the temp input value
};

export default function QuarterPlannerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planningData, setPlanningData] = useState<QuarterPlanningData>({
    team_id: '',
    y1_sales: null,
    y1_profit: null,
    target_sales: null,
    target_profit: null,
  });
  const [quarterData, setQuarterData] = useState<QuarterData[]>([]);
  const [editingCells, setEditingCells] = useState<EditingCells>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [dialogFormData, setDialogFormData] = useState<QuarterPlanningData>({
    team_id: '',
    y1_sales: null,
    y1_profit: null,
    target_sales: null,
    target_profit: null,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPlanningData();
  }, []);

  useEffect(() => {
    const hasData =
      planningData.y1_sales &&
      planningData.y1_profit &&
      planningData.target_sales &&
      planningData.target_profit;
    if (
      hasData &&
      (!planningData.straight_line_data ||
        Object.keys(planningData.straight_line_data).length === 0)
    ) {
      calculateStraightLineData();
    }
  }, [planningData]);

  const fetchPlanningData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      // Fetch existing planning data
      const { data: existingData, error } = await supabase
        .from('quarter_planning')
        .select('id, team_id, y1_sales, y1_profit, target_sales, target_profit, straight_line_data, actual_data, created_at, updated_at')
        .eq('team_id', teamId)
        .maybeSingle();

      if (error) throw error;

      if (existingData) {
        setPlanningData({
          ...existingData,
          y1_sales: existingData.y1_sales ? Number(existingData.y1_sales) : null,
          y1_profit: existingData.y1_profit ? Number(existingData.y1_profit) : null,
          target_sales: existingData.target_sales ? Number(existingData.target_sales) : null,
          target_profit: existingData.target_profit ? Number(existingData.target_profit) : null,
          straight_line_data: existingData.straight_line_data || {},
          actual_data: existingData.actual_data || {},
        });

        // Check if we have straight line data in JSON format
        const straightLineData = existingData.straight_line_data;
        const actualData = existingData.actual_data;

        if (straightLineData && typeof straightLineData === 'object' && Object.keys(straightLineData).length > 0) {
          // Build quarter data from JSON straight line data
          const quarterDataFromDB: QuarterData[] = [];
          
          for (let i = 1; i <= 12; i++) {
            const quarter = `Q${i}`;
            const straightLine = straightLineData[quarter];
            const actual = actualData?.[quarter];
            
            if (straightLine) {
              const quarterEntry = {
                quarter,
                straight_line_sales: Number(straightLine.sales),
                straight_line_profit: Number(straightLine.profit),
                straight_line_margin: Number(straightLine.margin),
                actual_sales: actual?.sales !== undefined && actual?.sales !== null ? Number(actual.sales) : null,
                actual_profit: actual?.profit !== undefined && actual?.profit !== null ? Number(actual.profit) : null,
                actual_margin: actual?.margin !== undefined && actual?.margin !== null ? Number(actual.margin) : null,
              };
              
              quarterDataFromDB.push(quarterEntry);
            }
          }

          setQuarterData(quarterDataFromDB);
        } else {
          // Data will be calculated by the useEffect hook that watches planningData
        }
      } else {
        setPlanningData(prev => ({ ...prev, team_id: teamId }));
      }
    } catch (error) {
      console.error("Error fetching planning data:", error);
      toast.error("Failed to fetch planning data");
    } finally {
      setLoading(false);
    }
  };

  const saveStraightLineData = async (quarters: QuarterData[]) => {
    try {
      if (!planningData.id) return;

      // Convert quarters array to JSON object
      const straightLineData: Record<string, { sales: number; profit: number; margin: number }> = {};
      quarters.forEach(quarter => {
        straightLineData[quarter.quarter] = {
          sales: quarter.straight_line_sales,
          profit: quarter.straight_line_profit,
          margin: quarter.straight_line_margin,
        };
      });

      // Update the planning record with straight line data
      const { error } = await supabase
        .from('quarter_planning')
        .update({ straight_line_data: straightLineData })
        .eq('id', planningData.id);

      if (error) throw error;

      // Update planning data state with new straight line data
      setPlanningData(prev => ({
        ...prev,
        straight_line_data: straightLineData,
      }));
    } catch (error) {
      console.error("Error saving straight line data:", error);
      toast.error("Failed to save straight line data");
    }
  };

  const calculateStraightLineData = async () => {
    const { y1_sales, y1_profit, target_sales, target_profit } = planningData;
    
    if (!y1_sales || !y1_profit || !target_sales || !target_profit) return;

    const quarters = [];
    
    // Calculate the compound quarterly growth rate
    // From the sheet: appears to be ~9.6% quarterly growth
    const totalGrowthFactor = target_sales / y1_sales; // e.g., 3M / 1M = 3
    const quarterlyGrowthRate = Math.pow(totalGrowthFactor, 1/12) - 1; // Compound growth over 12 quarters
    
    // Use TARGET margin consistently for straight line calculations (like in your sheet)
    const targetMargin = (target_profit / target_sales) * 100; // e.g., 20%
    
    // Calculate Q1 starting point that will reach annual target by Q12
    // If target is $3M annually, Q12 should be target_sales / 4 (quarterly)
    const q12Sales = target_sales / 4; // Quarterly target (3M annual / 4 quarters)
    const q1Sales = q12Sales / Math.pow(1 + quarterlyGrowthRate, 11);

    for (let i = 1; i <= 12; i++) {
      // Calculate sales using compound growth
      const quarterSales = q1Sales * Math.pow(1 + quarterlyGrowthRate, i - 1);
      
      // Use consistent TARGET margin for straight line (like your sheet)
      const quarterMargin = targetMargin;
      
      // Calculate profit based on sales and target margin
      const quarterProfit = (quarterSales * quarterMargin) / 100;

      quarters.push({
        quarter: `Q${i}`,
        straight_line_sales: Math.round(quarterSales),
        straight_line_profit: Math.round(quarterProfit),
        straight_line_margin: Math.round(quarterMargin * 100) / 100,
        actual_sales: null,
        actual_profit: null,
        actual_margin: null,
      });
    }

    setQuarterData(quarters);
    
    // Save straight line data to database if planning data exists
    if (planningData.id) {
      await saveStraightLineData(quarters);
    }
  };

  const handleInputChange = (field: keyof QuarterPlanningData, value: string) => {
    const numericValue = value === '' ? null : Number(value);
    setDialogFormData(prev => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const openEditDialog = () => {
    // Initialize dialog form with current planning data
    setDialogFormData({ ...planningData });
    setEditDialogOpen(true);
  };

  const savePlanningData = async () => {
    try {
      setSaving(true);
      
      const { y1_sales, y1_profit, target_sales, target_profit, team_id } = dialogFormData;
      
      if (!y1_sales || !y1_profit || !target_sales || !target_profit) {
        toast.error("Please fill in all required fields");
        return;
      }

      const dataToSave = {
        team_id,
        y1_sales,
        y1_profit,
        target_sales,
        target_profit,
      };

      let updatedPlanningData;

      if (planningData.id) {
        // Update existing record
        const { error } = await supabase
          .from('quarter_planning')
          .update(dataToSave)
          .eq('id', planningData.id);

        if (error) throw error;
        
        // Update main planning data with dialog form data
        updatedPlanningData = { ...dialogFormData, id: planningData.id };
        setPlanningData(updatedPlanningData);
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('quarter_planning')
          .insert(dataToSave)
          .select('id')
          .single();

        if (error) throw error;
        
        // Update main planning data with dialog form data and new ID
        updatedPlanningData = { ...dialogFormData, id: data.id };
        setPlanningData(updatedPlanningData);
      }

      // Recalculate and save straight line data with updated planning targets
      setPlanningData(updatedPlanningData);
      
      // Calculate straight line data based on new targets
      const totalGrowthFactor = target_sales / y1_sales;
      const quarterlyGrowthRate = Math.pow(totalGrowthFactor, 1/12) - 1;
      const targetMargin = (target_profit / target_sales) * 100;
      const q12Sales = target_sales / 4;
      const q1Sales = q12Sales / Math.pow(1 + quarterlyGrowthRate, 11);

      const calculatedQuarters: QuarterData[] = [];
      for (let i = 1; i <= 12; i++) {
        const quarterSales = q1Sales * Math.pow(1 + quarterlyGrowthRate, i - 1);
        const quarterMargin = targetMargin;
        const quarterProfit = (quarterSales * quarterMargin) / 100;

        calculatedQuarters.push({
          quarter: `Q${i}`,
          straight_line_sales: Math.round(quarterSales),
          straight_line_profit: Math.round(quarterProfit),
          straight_line_margin: Math.round(quarterMargin * 100) / 100,
          actual_sales: null,
          actual_profit: null,
          actual_margin: null,
        });
      }

      // Save straight line data
      await saveStraightLineData(calculatedQuarters);

      // Update quarter data with calculated values, preserving any existing actual values
      setQuarterData(prevData => {
        return calculatedQuarters.map(newQuarter => {
          const existingQuarter = prevData.find(q => q.quarter === newQuarter.quarter);
          return {
            ...newQuarter,
            actual_sales: existingQuarter?.actual_sales || null,
            actual_profit: existingQuarter?.actual_profit || null,
            actual_margin: existingQuarter?.actual_margin || null,
          };
        });
      });

      setEditDialogOpen(false);
      toast.success("Planning data and straight line projections saved successfully");
    } catch (error) {
      console.error("Error saving planning data:", error);
      toast.error("Failed to save planning data");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (quarter: string, field: 'actual_sales' | 'actual_profit') => {
    const currentValue = quarterData.find(q => q.quarter === quarter)?.[field];
    const cellKey = `${quarter}-${field}`;
    setEditingCells(prev => ({
      ...prev,
      [cellKey]: currentValue?.toString() || ''
    }));
  };

  const cancelEditing = (quarter: string, field: 'actual_sales' | 'actual_profit') => {
    const cellKey = `${quarter}-${field}`;
    setEditingCells(prev => {
      const newState = { ...prev };
      delete newState[cellKey];
      return newState;
    });
  };

  const saveActualValue = async (quarter: string, field: 'actual_sales' | 'actual_profit', value: string) => {
    try {
      if (!planningData.id) {
        toast.error("Please save planning data first");
        return;
      }

      const numericValue = value === '' ? null : Number(value);

      // Get current quarter data
      const currentQuarterData = quarterData.find(q => q.quarter === quarter);
      const otherField = field === 'actual_sales' ? 'actual_profit' : 'actual_sales';
      const otherValue = currentQuarterData?.[otherField];

      // Get current actual data JSON and update it
      const { data: currentPlanningData, error: fetchError } = await supabase
        .from('quarter_planning')
        .select('actual_data')
        .eq('id', planningData.id)
        .single();

      if (fetchError) throw fetchError;

      const actualData = currentPlanningData.actual_data || {};
      
      // Update the specific quarter's data
      const existingQuarterData = actualData[quarter] || {};
      const sales = field === 'actual_sales' ? numericValue : (existingQuarterData.sales || otherValue);
      const profit = field === 'actual_profit' ? numericValue : (existingQuarterData.profit || otherValue);
      const margin = sales && profit && sales > 0 ? (profit / sales) * 100 : null;



      actualData[quarter] = {
        sales: sales !== null ? Number(sales) : null,
        profit: profit !== null ? Number(profit) : null,
        margin: margin !== null ? Number(margin) : null,
      };

      // Save updated actual data to database
      const { error } = await supabase
        .from('quarter_planning')
        .update({ actual_data: actualData })
        .eq('id', planningData.id);

      if (error) throw error;

      // Update planning data state with new actual data
      setPlanningData(prev => ({
        ...prev,
        actual_data: actualData,
      }));

      // Update local state
      setQuarterData(prev => 
        prev.map(q => {
          if (q.quarter === quarter) {
            const updatedQuarter = { ...q, [field]: numericValue };
            // Recalculate margin if both values are present
            if (updatedQuarter.actual_sales && updatedQuarter.actual_profit) {
              updatedQuarter.actual_margin = (updatedQuarter.actual_profit / updatedQuarter.actual_sales) * 100;
            }
            return updatedQuarter;
          }
          return q;
        })
      );

      // Remove from editing state
      const cellKey = `${quarter}-${field}`;
      setEditingCells(prev => {
        const newState = { ...prev };
        delete newState[cellKey];
        return newState;
      });
      
      toast.success("Actual value updated successfully");
    } catch (error) {
      console.error("Error saving actual value:", error);
      toast.error("Failed to save actual value");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, quarter: string, field: 'actual_sales' | 'actual_profit') => {
    const cellKey = `${quarter}-${field}`;
    const currentValue = editingCells[cellKey] || '';
    
    if (e.key === 'Enter') {
      saveActualValue(quarter, field, currentValue);
    } else if (e.key === 'Escape') {
      cancelEditing(quarter, field);
    }
  };

  const handleEditingValue = (quarter: string, field: 'actual_sales' | 'actual_profit', value: string) => {
    const cellKey = `${quarter}-${field}`;
    setEditingCells(prev => ({
      ...prev,
      [cellKey]: value
    }));
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return "—";
    return `${value.toFixed(1)}%`;
  };

  // Calculate QoQ Growth
  const calculateQoQGrowth = () => {
    const { y1_sales, y1_profit, target_sales, target_profit } = planningData;
    
    if (!y1_sales || !y1_profit || !target_sales || !target_profit) return { salesGrowth: 0, profitGrowth: 0 };

    // Calculate compound annual growth rate, then convert to quarterly
    const annualSalesGrowthFactor = target_sales / y1_sales; // e.g., 3M / 1M = 3x over 3 years
    const annualSalesGrowth = Math.pow(annualSalesGrowthFactor, 1/3) - 1; // Compound annual growth rate
    
    const annualProfitGrowthFactor = target_profit / y1_profit; // e.g., 600K / 100K = 6x over 3 years  
    const annualProfitGrowth = Math.pow(annualProfitGrowthFactor, 1/3) - 1; // Compound annual growth rate

    return {
      salesGrowth: annualSalesGrowth * 100, // Display as annual percentage
      profitGrowth: annualProfitGrowth * 100, // Display as annual percentage
    };
  };

  const annualGrowth = calculateQoQGrowth();

  // Prepare chart data and config
  const chartData = quarterData.map(quarter => ({
    quarter: quarter.quarter,
    "Straight Line Sales": quarter.straight_line_sales,
    "Actual Sales": quarter.actual_sales,
    "Straight Line Profit": quarter.straight_line_profit,
    "Actual Profit": quarter.actual_profit,
  }));

  const salesChartConfig = {
    "Straight Line Sales": {
      label: "Straight Line",
      color: "#94a3b8",
    },
    "Actual Sales": {
      label: "Actual",
      color: "#22c55e",
    },
  } satisfies ChartConfig;

  const profitChartConfig = {
    "Straight Line Profit": {
      label: "Straight Line",
      color: "#94a3b8",
    },
    "Actual Profit": {
      label: "Actual",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">12 Quarter Planner</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plan and track your sales and profit targets across 12 quarters. Compound growth projections based on your targets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setExplanationOpen(true)} variant="ghost" size="sm" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            How it works
          </Button>
          {planningData.y1_sales && planningData.y1_profit && planningData.target_sales && planningData.target_profit && (
            <Button onClick={openEditDialog} variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Targets
            </Button>
          )}
        </div>
      </div>

      {/* Compact Planning Summary */}
      {planningData.y1_sales && planningData.y1_profit && planningData.target_sales && planningData.target_profit ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Y1 Starting Point */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Y1 Starting Point</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(planningData.y1_sales)}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(planningData.y1_profit)} • {formatPercentage((planningData.y1_profit / planningData.y1_sales) * 100)}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3-Year Target */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">3-Year Target</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(planningData.target_sales)}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(planningData.target_profit)} • {formatPercentage((planningData.target_profit / planningData.target_sales) * 100)}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QoQ Sales Growth */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                                 <div>
                   <p className="text-sm font-medium text-gray-600">Annual Growth Rate</p>
                   <p className="text-lg font-bold text-green-600">{formatPercentage(annualGrowth.salesGrowth)}</p>
                   <p className="text-sm text-gray-500">Required annual growth to hit your target</p>
                 </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      ) : (
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Set up your 12-quarter planning</span>
              </div>
              <p className="text-gray-600">
                Configure your starting point and 3-year targets to begin planning.
              </p>
                             <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                 <DialogTrigger asChild>
                   <Button className="bg-blue-600 hover:bg-blue-700" onClick={openEditDialog}>
                     <Calculator className="h-4 w-4 mr-2" />
                     Configure Planning
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="sm:max-w-md">
                   <DialogHeader>
                     <DialogTitle>Configure Planning Targets</DialogTitle>
                   </DialogHeader>
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Y1 Starting Point */}
                       <div className="space-y-3">
                         <h3 className="font-medium text-gray-900">Y1 Starting Point</h3>
                         <div>
                           <Label htmlFor="setup-y1-sales">Sales</Label>
                           <Input
                             id="setup-y1-sales"
                             type="number"
                             placeholder="2,000,000"
                             value={dialogFormData.y1_sales?.toString() || ''}
                             onChange={(e) => handleInputChange('y1_sales', e.target.value)}
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="setup-y1-profit">Profit</Label>
                           <Input
                             id="setup-y1-profit"
                             type="number"
                             placeholder="100,000"
                             value={dialogFormData.y1_profit?.toString() || ''}
                             onChange={(e) => handleInputChange('y1_profit', e.target.value)}
                             className="mt-1"
                           />
                         </div>
                       </div>

                       {/* 3-Year Target */}
                       <div className="space-y-3">
                         <h3 className="font-medium text-gray-900">3-Year Target</h3>
                         <div>
                           <Label htmlFor="setup-target-sales">Sales</Label>
                           <Input
                             id="setup-target-sales"
                             type="number"
                             placeholder="10,000,000"
                             value={dialogFormData.target_sales?.toString() || ''}
                             onChange={(e) => handleInputChange('target_sales', e.target.value)}
                             className="mt-1"
                           />
                         </div>
                         <div>
                           <Label htmlFor="setup-target-profit">Profit</Label>
                           <Input
                             id="setup-target-profit"
                             type="number"
                             placeholder="2,000,000"
                             value={dialogFormData.target_profit?.toString() || ''}
                             onChange={(e) => handleInputChange('target_profit', e.target.value)}
                             className="mt-1"
                           />
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex justify-end gap-2">
                       <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                         Cancel
                       </Button>
                       <Button
                         onClick={savePlanningData}
                         disabled={saving || !dialogFormData.y1_sales || !dialogFormData.y1_profit || !dialogFormData.target_sales || !dialogFormData.target_profit}
                         className="bg-blue-600 hover:bg-blue-700"
                       >
                         {saving ? (
                           <>
                             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                             Saving...
                           </>
                         ) : (
                           <>
                             <Save className="h-4 w-4 mr-2" />
                             Save
                           </>
                         )}
                       </Button>
                     </div>
                   </div>
                 </DialogContent>
               </Dialog>
            </div>
          </CardContent>
                 </Card>
       )}

      {/* Main Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Planning Targets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Y1 Starting Point */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Y1 Starting Point</h3>
                <div>
                  <Label htmlFor="main-y1-sales">Sales</Label>
                  <Input
                    id="main-y1-sales"
                    type="number"
                    placeholder="2,000,000"
                    value={dialogFormData.y1_sales?.toString() || ''}
                    onChange={(e) => handleInputChange('y1_sales', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-y1-profit">Profit</Label>
                  <Input
                    id="main-y1-profit"
                    type="number"
                    placeholder="100,000"
                    value={dialogFormData.y1_profit?.toString() || ''}
                    onChange={(e) => handleInputChange('y1_profit', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* 3-Year Target */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">3-Year Target</h3>
                <div>
                  <Label htmlFor="main-target-sales">Sales</Label>
                  <Input
                    id="main-target-sales"
                    type="number"
                    placeholder="10,000,000"
                    value={dialogFormData.target_sales?.toString() || ''}
                    onChange={(e) => handleInputChange('target_sales', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="main-target-profit">Profit</Label>
                  <Input
                    id="main-target-profit"
                    type="number"
                    placeholder="2,000,000"
                    value={dialogFormData.target_profit?.toString() || ''}
                    onChange={(e) => handleInputChange('target_profit', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={savePlanningData}
                disabled={saving || !dialogFormData.y1_sales || !dialogFormData.y1_profit || !dialogFormData.target_sales || !dialogFormData.target_profit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Explanation Dialog */}
      <Dialog open={explanationOpen} onOpenChange={setExplanationOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-12">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-600" />
              How the 12Q Planner Works
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            
            {/* Section 1: What You Input */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. What You Input</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-blue-600">Y1 Starting Point:</span>
                  <span className="ml-2">Your current annual sales and profit numbers</span>
                </div>
                <div>
                  <span className="font-medium text-blue-600">3-Year Target:</span>
                  <span className="ml-2">Where you want to be in 3 years (12 quarters)</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <span className="text-sm text-gray-700">Example: Start at $2M sales → Reach $10M sales in 3 years</span>
                </div>
              </div>
            </div>

            {/* Section 2: How Growth is Calculated */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. How Growth is Calculated</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Annual Growth Rate</h4>
                  <p className="text-gray-700">We calculate how much you need to grow each year to hit your target.</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>71.0% per year (to go $2M → $10M)</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Quarterly Growth Rate</h4>
                  <p className="text-gray-700">Annual growth is broken into smaller quarterly steps.</p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>• Each quarter grows ~14.2% from the previous quarter</p>
                    <p>• This compounds over 12 quarters to reach your target</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Why Q1 Starts Where It Does */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Why Q1 Starts Where It Does</h3>
              <div className="space-y-3">
                <p className="text-gray-700">Q1 is calculated backwards from your final target to ensure you hit your goal.</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Q12 Target (quarterly):</span>
                    <span className="font-medium">$2.5M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Q1 Starting Point:</span>
                    <span className="font-medium">$571K</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth per quarter:</span>
                    <span className="font-medium">~14.2%</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <span className="text-sm text-gray-700">Think of it like: Working backwards from where you want to end up, then growing consistently each quarter to get there.</span>
                </div>
              </div>
            </div>

            {/* Section 4: The Two Tables */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Understanding the Two Tables</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Straight Line Table</h4>
                  <p className="text-gray-700 text-sm mb-3">Shows your "perfect" growth path using your target profit margin consistently.</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Q1: $571K sales × 20% = $114K profit</p>
                    <p>Q2: $653K sales × 20% = $131K profit</p>
                    <p>Q12: $2.5M sales × 20% = $500K profit</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600 mb-2">Actual Table</h4>
                  <p className="text-gray-700 text-sm mb-3">Where you input your real results as they happen.</p>
                  <div className="text-xs text-gray-600">
                    <p>Click any cell to edit and track your actual performance against the straight line target.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: How to Use This */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">5. How to Use This Tool</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-sm">1.</span>
                  <span className="text-gray-700">Set your starting point and 3-year target</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-sm">2.</span>
                  <span className="text-gray-700">Review the straight line growth path</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-sm">3.</span>
                  <span className="text-gray-700">Input actual results each quarter</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-sm">4.</span>
                  <span className="text-gray-700">Compare actual vs straight line to track progress</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-sm">5.</span>
                  <span className="text-gray-700">Adjust strategy if you're ahead or behind target</span>
                </div>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Charts */}
      {quarterData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Sales Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatCurrency(value)} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value: any) => formatCurrency(value)} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="Straight Line Sales"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Actual Sales"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22c55e" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Profit Chart */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Profit Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={profitChartConfig} className="h-[300px] w-full">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => formatCurrency(value)} />
                  <ChartTooltip 
                    content={<ChartTooltipContent formatter={(value: any) => formatCurrency(value)} />}
                  />
                  <Line
                    type="monotone"
                    dataKey="Straight Line Profit"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Actual Profit"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tables */}
      {quarterData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Straight Line Table */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Straight Line</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 bg-gray-50/50">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">QTR</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Sales</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Profit</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarterData.map((quarter) => (
                      <TableRow key={quarter.quarter} className="border-b border-gray-100">
                        <TableCell className="font-medium">{quarter.quarter}</TableCell>
                        <TableCell>{formatCurrency(quarter.straight_line_sales)}</TableCell>
                        <TableCell>{formatCurrency(quarter.straight_line_profit)}</TableCell>
                        <TableCell>{formatPercentage(quarter.straight_line_margin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Actual Table */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-100 bg-gray-50/50">
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">QTR</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Sales</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">Profit</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 uppercase">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quarterData.map((quarter) => (
                      <TableRow key={quarter.quarter} className="border-b border-gray-100">
                        <TableCell className="font-medium">{quarter.quarter}</TableCell>
                        <TableCell className="relative">
                          {editingCells[`${quarter.quarter}-actual_sales`] !== undefined ? (
                            <Input
                              type="number"
                              value={editingCells[`${quarter.quarter}-actual_sales`]}
                              onChange={(e) => handleEditingValue(quarter.quarter, 'actual_sales', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, quarter.quarter, 'actual_sales')}
                              onBlur={() => saveActualValue(quarter.quarter, 'actual_sales', editingCells[`${quarter.quarter}-actual_sales`])}
                              className="absolute top-2.5 left-5 h-8 text-sm w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-1 max-w-60"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-100 rounded flex items-center px-1 min-w-0"
                              onClick={() => startEditing(quarter.quarter, 'actual_sales')}
                            >
                              {formatCurrency(quarter.actual_sales)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="relative">
                          {editingCells[`${quarter.quarter}-actual_profit`] !== undefined ? (
                            <Input
                              type="number"
                              value={editingCells[`${quarter.quarter}-actual_profit`]}
                              onChange={(e) => handleEditingValue(quarter.quarter, 'actual_profit', e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, quarter.quarter, 'actual_profit')}
                              onBlur={() => saveActualValue(quarter.quarter, 'actual_profit', editingCells[`${quarter.quarter}-actual_profit`])}
                              className="absolute top-2.5 left-5 h-8 text-sm w-full border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded px-1 max-w-40"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="cursor-pointer hover:bg-gray-100 rounded flex items-center px-1 min-w-0"
                              onClick={() => startEditing(quarter.quarter, 'actual_profit')}
                            >
                              {formatCurrency(quarter.actual_profit)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatPercentage(quarter.actual_margin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 