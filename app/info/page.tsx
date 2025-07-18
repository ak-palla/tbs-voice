import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Building,
  Settings,
  BarChart3,
  Users,
  MessageSquare,
  Lightbulb,
  Target,
  Gauge,
  Shield,
  Zap,
  Rocket,
  Database,
  Globe,
  Code,
  Smartphone,
  Cloud,
  Star,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  Briefcase,
  Map,
  BookOpen,
  Edit,
  Upload,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Package,
  Layers
} from "lucide-react";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trades Business School</h1>
                <p className="text-sm text-gray-500">AI-Powered Business Management Platform</p>
              </div>
            </div>
            <Link href="/sign-in" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Trade Business with 
              <span className="text-blue-600"> AI-Powered </span>
              Management
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              A comprehensive business management and AI coaching platform designed specifically for trade businesses. 
<<<<<<< HEAD
              Optimize operations, drive growth, and streamline processes with intelligent automation.
=======
              Optimise operations, drive growth, and streamline processes with intelligent automation.
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="text-sm py-2 px-4">🚀 Growth Optimization</Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">🤖 AI-Powered Insights</Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">📊 Business Analytics</Badge>
              <Badge variant="secondary" className="text-sm py-2 px-4">⚡ Process Automation</Badge>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Built with Modern Technology</h3>
            <p className="text-lg text-gray-600">Enterprise-grade technology stack for reliability and performance</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Code className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Next.js 14+</h4>
                <p className="text-sm text-gray-600">Modern React framework with App Router</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Supabase</h4>
                <p className="text-sm text-gray-600">PostgreSQL database with real-time features</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">OpenAI & Gemini</h4>
                <p className="text-sm text-gray-600">Advanced AI models for intelligent insights</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Smartphone className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Responsive Design</h4>
                <p className="text-sm text-gray-600">Mobile-first with Tailwind CSS</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Business Management Suite</h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
<<<<<<< HEAD
              Everything you need to run, grow, and optimize your trade business in one powerful platform
=======
              Everything you need to run, grow, and optimise your trade business in one powerful platform
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Dashboard */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <CardTitle>AI-Powered Dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Get intelligent business insights with AI-driven analysis of your operations, performance metrics, and growth opportunities.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Business Health Analysis</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Priority Task Generation</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Performance Metrics</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Smart Caching System</li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Machines */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Settings className="h-8 w-8 text-green-600" />
                  <CardTitle>Business "Machines"</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
<<<<<<< HEAD
                  Structured process optimization through Growth, Fulfillment, and Innovation machines with visual workflow design.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Growth Machine Planning</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Fulfillment Optimization</li>
=======
                  Structured process optimization through Growth, Fulfilment, and Innovation machines with visual workflow design.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Growth Machine Planning</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Fulfilment Optimization</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Innovation Management</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Figma Integration</li>
                </ul>
              </CardContent>
            </Card>

            {/* Strategic Planning */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Target className="h-8 w-8 text-purple-600" />
                  <CardTitle>Strategic Planning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Comprehensive planning tools including Battle Plans, Chain of Command, and Quarterly Sprint Canvas for strategic execution.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Business Battle Plans</li>
<<<<<<< HEAD
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Organizational Structure</li>
=======
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Organisational Structure</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Quarterly Planning</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Progress Tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Chat System */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                  <CardTitle>Intelligent Chat System</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Vector-powered contextual conversations with specialized AI for business coaching and innovation guidance.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Contextual Conversations</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Innovation Chat</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Business Context Aware</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Learning System</li>
                </ul>
              </CardContent>
            </Card>

            {/* Operations Management */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Gauge className="h-8 w-8 text-red-600" />
                  <CardTitle>Operations Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Streamline daily operations with task prioritization, meeting planning, and comprehensive scorecards.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Triage Planning</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Meeting Rhythm</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Company Scorecard</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />KPI Tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Analytics & Insights */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                  <CardTitle>Analytics & Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Data-driven insights with customer review analysis, performance tracking, and business intelligence.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Review Analysis</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Performance Metrics</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Business Intelligence</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Predictive Analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Page Descriptions */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Detailed Module Breakdown</h3>
            <p className="text-lg text-gray-600">Deep dive into each module and what it accomplishes for your business</p>
          </div>

          <div className="space-y-8">
            {/* Dashboard */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">AI Dashboard</CardTitle>
                      <CardDescription>Central command center for business intelligence</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Core Feature</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">What it does:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
<<<<<<< HEAD
                      <li>• Analyzes your complete business data using AI to identify strengths, weaknesses, and opportunities</li>
                      <li>• Generates personalized priority tasks based on your business goals and current performance</li>
=======
                      <li>• Analyses your complete business data using AI to identify strengths, weaknesses, and opportunities</li>
                      <li>• Generates personalised priority tasks based on your business goals and current performance</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      <li>• Provides real-time business health scores across key areas like sales, operations, and finance</li>
                      <li>• Tracks progress metrics with visual charts and trend analysis</li>
                      <li>• Integrates customer review analysis with sentiment scoring</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Key Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Smart Caching:</strong> 15-minute refresh cycles for optimal performance</li>
                      <li>• <strong>Business Health Monitor:</strong> AI-driven assessment of critical business areas</li>
                      <li>• <strong>Priority Task Engine:</strong> Intelligent task recommendations with deadlines</li>
                      <li>• <strong>Progress Analytics:</strong> Comprehensive tracking of business milestones</li>
                      <li>• <strong>Team Overview:</strong> Staff management and upcoming meetings display</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Machine */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Rocket className="h-8 w-8 text-green-600" />
                    <div>
                      <CardTitle className="text-xl">Growth Machine</CardTitle>
                      <CardDescription>Customer acquisition and revenue optimization engine</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Growth Engine</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Planner Module:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Define triggering events that start your customer acquisition process</li>
                      <li>• Map out specific actions and activities in your growth workflow</li>
                      <li>• Set ending events that complete the customer journey</li>
                      <li>• Visual workflow design with Figma integration for process mapping</li>
<<<<<<< HEAD
                      <li>• Track conversion rates and optimize each step of the funnel</li>
=======
                      <li>• Track conversion rates and optimise each step of the funnel</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Analytics Module:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Lead Source Tracking:</strong> Monitor where your best customers come from</li>
                      <li>• <strong>Conversion Analysis:</strong> Measure success rates at each stage</li>
                      <li>• <strong>ROI Calculation:</strong> Track customer acquisition cost vs. lifetime value</li>
                      <li>• <strong>Performance Metrics:</strong> Revenue tracking per channel</li>
                      <li>• <strong>Growth Insights:</strong> AI-powered recommendations for optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fulfillment Machine */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-8 w-8 text-purple-600" />
                    <div>
                      <CardTitle className="text-xl">Fulfillment Machine</CardTitle>
                      <CardDescription>Service delivery and customer satisfaction optimization</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Operations Engine</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Process Management:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Design your complete service delivery workflow from start to finish</li>
                      <li>• Define quality checkpoints and approval stages</li>
                      <li>• Set up automated notifications and reminders for team members</li>
                      <li>• Track job progress in real-time with status updates</li>
                      <li>• Manage resource allocation and scheduling optimization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Performance Tracking:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>KPI Monitoring:</strong> Track key performance indicators at each stage</li>
                      <li>• <strong>Quality Metrics:</strong> Customer satisfaction and completion rates</li>
                      <li>• <strong>Efficiency Analysis:</strong> Time-to-completion and productivity measures</li>
                      <li>• <strong>Cost Tracking:</strong> Monitor expenses and profit margins per job</li>
                      <li>• <strong>Bottleneck Identification:</strong> AI-powered process optimization suggestions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Innovation Machine */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="h-8 w-8 text-orange-600" />
                    <div>
                      <CardTitle className="text-xl">Innovation Machine</CardTitle>
                      <CardDescription>AI-powered business innovation and strategic development</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">AI Innovation</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Innovation Chat:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Specialized AI trained on business innovation methodologies</li>
                      <li>• Contextual suggestions based on your specific business data</li>
                      <li>• Market trend analysis and competitive intelligence</li>
                      <li>• Innovation opportunity identification and feasibility analysis</li>
                      <li>• Implementation roadmaps with risk assessments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Strategic Development:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Idea Generation:</strong> AI-powered brainstorming for new services/products</li>
                      <li>• <strong>Market Analysis:</strong> Automated research on industry trends</li>
                      <li>• <strong>Technology Integration:</strong> Recommendations for digital transformation</li>
                      <li>• <strong>Process Innovation:</strong> Efficiency improvements and automation opportunities</li>
                      <li>• <strong>Training Archive:</strong> Conversation history used to improve AI responses</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Planning Modules */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-8 w-8 text-indigo-600" />
                    <div>
                      <CardTitle className="text-xl">Strategic Planning Suite</CardTitle>
                      <CardDescription>Comprehensive business strategy and execution tools</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Strategy Tools</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-indigo-600" />
                      Battle Plan
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Strategic initiative tracking across business categories</li>
                      <li>• Outcome-focused planning with clear ownership</li>
                      <li>• Timeline management and milestone tracking</li>
                      <li>• Progress monitoring with status updates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-indigo-600" />
                      Chain of Command
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
<<<<<<< HEAD
                      <li>• Organizational hierarchy management</li>
=======
                      <li>• Organisational hierarchy management</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      <li>• Role and responsibility definition</li>
                      <li>• Contact information and reporting structure</li>
                      <li>• Team communication optimization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <Star className="h-4 w-4 mr-2 text-indigo-600" />
                      Sprint Canvas
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Quarterly goal setting (OKRs)</li>
                      <li>• Sprint-based business planning</li>
                      <li>• Progress visualization and tracking</li>
                      <li>• Team accountability and reviews</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Management Modules */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gauge className="h-8 w-8 text-red-600" />
                    <div>
                      <CardTitle className="text-xl">Operations Management</CardTitle>
                      <CardDescription>Daily operations, performance tracking, and workflow optimization</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Operations</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
<<<<<<< HEAD
                      Triage Planner
=======
                      Company Overview
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Problem identification and root cause analysis</li>
                      <li>• Urgent vs. important task categorization</li>
                      <li>• Resource allocation optimization</li>
                      <li>• Action plan development and tracking</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-red-600" />
                      Meeting Rhythm
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Meeting schedule optimization</li>
                      <li>• Recurring meeting management</li>
                      <li>• Agenda and outcome tracking</li>
                      <li>• Team coordination and communication</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-red-600" />
                      Company Scorecard
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• KPI dashboard and metrics tracking</li>
                      <li>• Performance benchmarking</li>
                      <li>• Business health indicators</li>
                      <li>• Automated reporting and alerts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playbook Management */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-teal-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-8 w-8 text-teal-600" />
                    <div>
                      <CardTitle className="text-xl">Playbook Planner</CardTitle>
                      <CardDescription>Strategic playbook management and execution tracking</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Content Management</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Playbook Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Create and manage business playbooks for different engine types (Growth, Fulfillment, Innovation)</li>
                      <li>• Search and filter playbooks by name, description, owner, or engine type</li>
                      <li>• Track playbook status (Backlog, In Progress, Behind, Completed)</li>
                      <li>• Assign ownership and set completion deadlines</li>
                      <li>• Archive and version control for historical reference</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Management Capabilities:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Engine Integration:</strong> Link playbooks to specific business machines</li>
                      <li>• <strong>Progress Tracking:</strong> Monitor implementation status and timeline</li>
                      <li>• <strong>Team Collaboration:</strong> Assign tasks and track team contributions</li>
                      <li>• <strong>Template Library:</strong> Reusable playbook templates for common scenarios</li>
                      <li>• <strong>Performance Analytics:</strong> Measure playbook effectiveness and ROI</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat System */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-cyan-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-8 w-8 text-cyan-600" />
                    <div>
                      <CardTitle className="text-xl">AI Chat Systems</CardTitle>
                      <CardDescription>Intelligent conversational AI with business context</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">AI Assistant</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">General Chat Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Vector-powered semantic search through your business data</li>
                      <li>• Contextual responses based on your complete business profile</li>
                      <li>• Chat history storage and retrieval for continuous conversations</li>
                      <li>• Multi-session support with conversation threading</li>
                      <li>• Smart suggestions based on previous interactions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Innovation Chat Specialization:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Innovation Focus:</strong> Specialized AI trained on business innovation</li>
                      <li>• <strong>Market Intelligence:</strong> Access to industry trends and competitive analysis</li>
                      <li>• <strong>Opportunity Discovery:</strong> AI-driven identification of growth opportunities</li>
                      <li>• <strong>Implementation Guidance:</strong> Step-by-step innovation roadmaps</li>
                      <li>• <strong>Training Integration:</strong> Conversations archived for continuous AI improvement</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOP Management */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-amber-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-amber-600" />
                    <div>
<<<<<<< HEAD
                      <CardTitle className="text-xl">SOP Management</CardTitle>
                      <CardDescription>Standard Operating Procedures and document management</CardDescription>
=======
                      <CardTitle className="text-xl">Battle Plan Management</CardTitle>
                      <CardDescription>Battle Plan and document management</CardDescription>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                    </div>
                  </div>
                  <Badge variant="secondary">Documentation</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Document Management:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Upload and store PDF, DOCX, and other document formats</li>
                      <li>• Automatic text extraction and indexing for searchability</li>
                      <li>• Version control and document history tracking</li>
                      <li>• Secure access controls and user permissions</li>
                      <li>• Integration with business machines and playbooks</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">SOP Features:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• <strong>Process Documentation:</strong> Step-by-step procedure creation</li>
                      <li>• <strong>Template Library:</strong> Reusable SOP templates for common processes</li>
                      <li>• <strong>Compliance Tracking:</strong> Ensure procedures meet industry standards</li>
<<<<<<< HEAD
                      <li>• <strong>Training Integration:</strong> Link SOPs to employee training programs</li>
=======
                      <li>• <strong>Training Integration:</strong> Link SOPs to employee training Programmes</li>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                      <li>• <strong>Performance Monitoring:</strong> Track SOP effectiveness and adherence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* AI & Security Features */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🤖 Advanced AI Integration</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Vector Search System</h4>
                    <p className="text-sm text-gray-600">Qdrant-powered semantic search with OpenAI embeddings for intelligent content discovery</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Contextual AI</h4>
                    <p className="text-sm text-gray-600">Business-aware responses with historical context and comprehensive data integration</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Smart Caching</h4>
                    <p className="text-sm text-gray-600">Performance optimization with intelligent data management and 15-minute refresh cycles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Innovation Engine</h4>
                    <p className="text-sm text-gray-600">AI-driven business innovation and growth strategies with market trend analysis</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🔐 Security & Architecture</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Row Level Security</h4>
                    <p className="text-sm text-gray-600">Database-level security with complete user data isolation and access control</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Role-Based Access</h4>
                    <p className="text-sm text-gray-600">Secure authentication with Supabase Auth and granular permission management</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Cloud className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Cloud Storage</h4>
                    <p className="text-sm text-gray-600">Secure file upload and document management with automatic backup and versioning</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">API Protection</h4>
                    <p className="text-sm text-gray-600">Middleware-based route protection with comprehensive validation and monitoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Built for Trade Professionals</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
<<<<<<< HEAD
                  Specifically designed for contractors, electricians, plumbers, HVAC professionals, and other trade businesses seeking to optimize operations and accelerate growth
=======
                  Specifically designed for contractors, electricians, plumbers, HVAC professionals, and other trade businesses seeking to optimise operations and accelerate growth
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Small to Medium Businesses</h4>
<<<<<<< HEAD
                  <p className="text-sm text-gray-600">Optimized for growing trade businesses ready to scale operations and implement systematic processes</p>
=======
                  <p className="text-sm text-gray-600">Optimised for growing trade businesses ready to scale operations and implement systematic processes</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Team Management</h4>
                  <p className="text-sm text-gray-600">Coordinate teams, manage complex projects, and ensure consistent service delivery across all operations</p>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">Growth Focused</h4>
                  <p className="text-sm text-gray-600">Data-driven insights for sustainable business growth with measurable ROI and performance tracking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Trade Business?</h3>
              <p className="text-xl mb-8 opacity-90">
                Join the revolution of AI-powered business management and take your trade business to the next level with comprehensive tools and intelligent automation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/sign-up" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/sign-in" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2025 Trades Business School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}