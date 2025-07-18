"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Search,
  Settings,
  TrendingUp,
  Database,
  Brain,
  Target
} from "lucide-react";

interface SystemStatus {
  status: string;
  totalInstructions: number;
  activeInstructions: number;
  instructionsWithEmbeddings: number;
  recommendation: string;
}

interface RAGAnalysis {
  query: string;
  retrievalMetrics: {
    totalRetrieved: number;
    averageSimilarity: number;
    retrievalTime: number;
    thresholdUsed: number;
  };
  qualityMetrics: {
    retrievalPrecision: number;
    coverageScore: number;
    diversityScore: number;
  };
  recommendations: string[];
}

interface ResponseQuality {
  query: string;
  qualityScores: {
    relevance: number;
    completeness: number;
    actionability: number;
    businessContext: number;
    structure: number;
    overallScore: number;
  };
  improvements: {
    suggestions: string[];
  };
}

export default function RAGDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testQuery, setTestQuery] = useState("How can I improve my business growth?");
  const [ragAnalysis, setRagAnalysis] = useState<RAGAnalysis | null>(null);
  const [responseQuality, setResponseQuality] = useState<ResponseQuality | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load system status on mount
  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/debug/fix-instructions');
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
      toast.error('Failed to load system status');
    } finally {
      setIsLoading(false);
    }
  };

  const fixInstructions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/debug/fix-instructions', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`✅ Activated ${data.activated} instructions`);
        await loadSystemStatus();
      } else {
        throw new Error('Failed to activate instructions');
      }
    } catch (error) {
      console.error('Failed to fix instructions:', error);
      toast.error('Failed to activate instructions');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeRAGPerformance = async () => {
    if (!testQuery.trim()) {
      toast.error('Please enter a test query');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Analyze RAG retrieval
      const ragResponse = await fetch('/api/debug/rag-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery })
      });

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        setRagAnalysis(ragData);
        
        // Generate sample response for quality analysis
        const chatResponse = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'chat',
            message: testQuery
          })
        });

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          
          // Analyze response quality
          const qualityResponse = await fetch('/api/debug/response-quality', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: testQuery,
              response: chatData.content || 'No response generated'
            })
          });

          if (qualityResponse.ok) {
            const qualityData = await qualityResponse.json();
            setResponseQuality(qualityData);
          }
        }
        
        toast.success('Analysis complete!');
      } else {
        throw new Error('RAG analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'broken': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score: number) => `${(score * 100).toFixed(0)}%`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RAG Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and optimize your AI retrieval system</p>
        </div>
        <Button onClick={loadSystemStatus} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Instructions</p>
                <p className="text-2xl font-bold">{systemStatus?.totalInstructions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Instructions</p>
                <p className="text-2xl font-bold">{systemStatus?.activeInstructions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">With Embeddings</p>
                <p className="text-2xl font-bold">{systemStatus?.instructionsWithEmbeddings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                systemStatus?.status === 'healthy' ? 'bg-green-500' : 
                systemStatus?.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-sm font-medium capitalize">{systemStatus?.status || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {systemStatus?.recommendation.includes('CRITICAL') && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Critical Issue Detected</h3>
                <p className="text-red-700 mt-1">{systemStatus.recommendation}</p>
                <Button 
                  onClick={fixInstructions} 
                  disabled={isLoading}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fix Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          {/* Test Query Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Test RAG Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a test query..."
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={analyzeRAGPerformance} 
                  disabled={isAnalyzing || !testQuery.trim()}
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          {(ragAnalysis || responseQuality) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* RAG Retrieval Metrics */}
              {ragAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Retrieval Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Instructions Retrieved</p>
                        <p className="text-xl font-bold">{ragAnalysis.retrievalMetrics.totalRetrieved}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Avg Similarity</p>
                        <p className={`text-xl font-bold ${getScoreColor(ragAnalysis.retrievalMetrics.averageSimilarity)}`}>
                          {formatScore(ragAnalysis.retrievalMetrics.averageSimilarity)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retrieval Time</p>
                        <p className="text-xl font-bold">{ragAnalysis.retrievalMetrics.retrievalTime}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Threshold Used</p>
                        <p className="text-xl font-bold">{ragAnalysis.retrievalMetrics.thresholdUsed}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Quality Scores</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Precision</span>
                          <span className={`font-medium ${getScoreColor(ragAnalysis.qualityMetrics.retrievalPrecision)}`}>
                            {formatScore(ragAnalysis.qualityMetrics.retrievalPrecision)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Coverage</span>
                          <span className={`font-medium ${getScoreColor(ragAnalysis.qualityMetrics.coverageScore)}`}>
                            {formatScore(ragAnalysis.qualityMetrics.coverageScore)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Diversity</span>
                          <span className={`font-medium ${getScoreColor(ragAnalysis.qualityMetrics.diversityScore)}`}>
                            {formatScore(ragAnalysis.qualityMetrics.diversityScore)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Response Quality Metrics */}
              {responseQuality && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Response Quality
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Overall Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(responseQuality.qualityScores.overallScore)}`}>
                        {formatScore(responseQuality.qualityScores.overallScore)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Detailed Scores</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Relevance</span>
                          <span className={`font-medium ${getScoreColor(responseQuality.qualityScores.relevance)}`}>
                            {formatScore(responseQuality.qualityScores.relevance)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Completeness</span>
                          <span className={`font-medium ${getScoreColor(responseQuality.qualityScores.completeness)}`}>
                            {formatScore(responseQuality.qualityScores.completeness)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Actionability</span>
                          <span className={`font-medium ${getScoreColor(responseQuality.qualityScores.actionability)}`}>
                            {formatScore(responseQuality.qualityScores.actionability)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Business Context</span>
                          <span className={`font-medium ${getScoreColor(responseQuality.qualityScores.businessContext)}`}>
                            {formatScore(responseQuality.qualityScores.businessContext)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Structure</span>
                          <span className={`font-medium ${getScoreColor(responseQuality.qualityScores.structure)}`}>
                            {formatScore(responseQuality.qualityScores.structure)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAG Recommendations */}
            {ragAnalysis?.recommendations && ragAnalysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>RAG Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ragAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Response Quality Suggestions */}
            {responseQuality?.improvements?.suggestions && responseQuality.improvements.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quality Improvements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {responseQuality.improvements.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => window.open('/admin/rag', '_blank')}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <Database className="h-6 w-6 mb-1" />
                  <span>Manage Embeddings</span>
                </Button>

                <Button 
                  onClick={() => window.open('/admin/instructions', '_blank')}
                  variant="outline"
                  className="h-16 flex-col"
                >
                  <Brain className="h-6 w-6 mb-1" />
                  <span>Manage Instructions</span>
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    onClick={fixInstructions} 
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                  >
                    Activate All Instructions
                  </Button>
                  <Button 
                    onClick={() => window.open('/api/embeddings/init', '_blank')}
                    size="sm"
                    variant="outline"
                  >
                    Regenerate Embeddings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 