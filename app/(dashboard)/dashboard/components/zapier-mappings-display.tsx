"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Link, Settings, Settings2Icon } from 'lucide-react';

interface ZapierMapping {
  id: string;
  display_name: string | null;
  zapier_field_name: string;
  internal_field_name: string;
  sample_value: string | null;
}

export default function ZapierMappingsDisplay() {
  const [mappings, setMappings] = useState<ZapierMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('zapier_mappings')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        setMappings(data || []);
      } catch (err: any) {
        console.error("Error fetching Zapier mappings:", err.message);
        setError(`Failed to load Zapier mappings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-sm animate-pulse">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-800">
            <Settings2Icon className="h-5 w-5 text-gray-600" /> Zapier Mappings
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner /> Loading mappings...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-sm border-red-400 bg-red-50 text-red-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2 text-red-800">
            <Settings2Icon className="h-5 w-5 text-red-600" /> Financial Data 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Error: {error}</p>
          <p className="text-sm">Please try again later or contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-800">
          <Settings2Icon className="h-5 w-5 text-gray-600" /> Financial Data 
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mappings.length === 0 ? (
          <p className="text-gray-500 text-center">No Zapier mappings found for your account. Connect Zapier to see your data integrations here!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mappings.map((mapping) => (
              <Card key={mapping.id} className="p-4 shadow-sm">
                <p className="text-lg font-medium text-gray-800 mb-1">{mapping.display_name || 'Unnamed Mapping'}</p>
                {/* <p className="text-sm text-gray-600"><strong>Zapier Field:</strong> {mapping.zapier_field_name}</p>
                <p className="text-sm text-gray-600"><strong>Internal Field:</strong> {mapping.internal_field_name}</p> */}
                {mapping.sample_value && (
                  <p className="text-xs text-gray-500 mt-1"><em>£{mapping.sample_value}</em></p>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 