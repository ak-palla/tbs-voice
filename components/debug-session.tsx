"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function DebugSession() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setError(error.message);
        } else {
          console.log("Session data:", data);
          setSessionData(data);
        }
      } catch (err) {
        console.error("Failed to check session:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
  }, []);
  
  if (loading) {
    return <div className="p-2 bg-yellow-100 text-yellow-800 text-xs rounded">Checking session...</div>;
  }
  
  if (error) {
    return <div className="p-2 bg-red-100 text-red-800 text-xs rounded">Session error: {error}</div>;
  }
  
  const hasSession = sessionData?.session !== null;
  
  return (
    <div className={`p-2 ${hasSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded`}>
      Session: {hasSession ? 'Active' : 'Not found'}
      {hasSession && sessionData?.session?.user && (
        <div className="mt-1">User: {sessionData.session.user.email}</div>
      )}
    </div>
  );
} 