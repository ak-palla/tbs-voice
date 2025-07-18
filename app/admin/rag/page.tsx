"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RefreshCw, Database, SearchCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function RAGManagementPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [testQuery, setTestQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Initialize pgvector and the database schema
  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      const response = await fetch("/api/embeddings/init", {
        method: "POST",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initialize RAG system");
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setPendingCount(data.processed || 0);
      
      toast.success(`RAG system initialized! Processed ${data.processed} instructions.`);
    } catch (error) {
      console.error("Error initializing RAG:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initialize RAG system");
    } finally {
      setIsInitializing(false);
    }
  };

  // Check for instructions that need embedding updates
  const checkPendingEmbeddings = async () => {
    try {
      const response = await fetch("/api/embeddings/update", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error("Failed to check pending embeddings");
      }
      
      const data = await response.json();
      setPendingCount(data.pendingCount);
      
      toast.info(`${data.pendingCount} instructions need embedding updates.`);
    } catch (error) {
      console.error("Error checking pending embeddings:", error);
      toast.error("Failed to check pending embeddings status");
    }
  };

  // Update embeddings for all pending instructions
  const updateAllEmbeddings = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/embeddings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update embeddings");
      }
      
      const data = await response.json();
      setResults(data.results || []);
      
      // Check updated count
      await checkPendingEmbeddings();
      
      toast.success(`Successfully processed ${data.processed} instructions.`);
    } catch (error) {
      console.error("Error updating embeddings:", error);
      toast.error("Failed to update embeddings");
    } finally {
      setIsUpdating(false);
    }
  };

  // Test vector search with a query
  const testVectorSearch = async () => {
    if (!testQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchResults([]);
      
      // First, let's test search directly with OpenAI embeddings
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userQuery: testQuery,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to test vector search");
      }
      
      const data = await response.json();
      
      // Display the session ID as confirmation
      toast.success(`Test completed. Session ID: ${data.id}`);
      
      // In a real application, you would display the actual search results here
      
    } catch (error) {
      console.error("Error testing vector search:", error);
      toast.error("Failed to test vector search");
    } finally {
      setIsSearching(false);
    }
  };

  // Check pending embeddings on component mount
  React.useEffect(() => {
    checkPendingEmbeddings();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">RAG System Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Initialize RAG System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Initialize the pgvector extension and database schema required for the RAG system.
              This will also update embeddings for existing instructions.
            </p>
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Initialize RAG System"
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Update Embeddings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <p className="text-sm text-muted-foreground">
                Update embeddings for instructions that need them.
              </p>
              {pendingCount !== null && (
                <Badge variant={pendingCount > 0 ? "destructive" : "secondary"}>
                  {pendingCount} pending
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={checkPendingEmbeddings}
                className="flex-1"
              >
                Check Status
              </Button>
              
              <Button 
                onClick={updateAllEmbeddings} 
                disabled={isUpdating || pendingCount === 0}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update All"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchCheck className="h-5 w-5" />
            Test Vector Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Test the RAG system by entering a query to see how it retrieves relevant instructions.
          </p>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter a test query..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1"
            />
            
            <Button 
              onClick={testVectorSearch} 
              disabled={isSearching || !testQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Test Search"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs overflow-auto max-h-60">
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 