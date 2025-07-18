"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { PlusCircle, Save, Trash2, Copy, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface ZapierMapping {
  id?: string;
  zapier_field_name: string;
  internal_field_name: string;
  display_name?: string;
  sample_value?: string;
  user_id?: string;
}

interface ZapierWebhookData {
  id: string;
  created_at: string;
  source_app: string;
  event_type: string;
  raw_payload: any;
}

const INTERNAL_FIELDS = ['field1', 'field2', 'field3', 'field4', 'field5', 'field6'];

export default function ZapierMappingsPage() {
  const [mappings, setMappings] = useState<ZapierMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newZapierField, setNewZapierField] = useState('');
  const [newInternalField, setNewInternalField] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newSampleValue, setNewSampleValue] = useState('');
  const [availableZapierFields, setAvailableZapierFields] = useState<string[]>([]);
  const [availableInternalFields, setAvailableInternalFields] = useState<string[]>(INTERNAL_FIELDS);
  const [latestWebhookPayload, setLatestWebhookPayload] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState<string>('');
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserIdAndAppUrl();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMappings();
      fetchLatestWebhookData();
    }
  }, [userId]);

  const fetchUserIdAndAppUrl = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
    setAppUrl(window.location.origin);
  };

  const fetchLatestWebhookData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // FIX: Include userId parameter in the API call
      const response = await fetch(`/api/dashboard/zapier-data?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const latestPayload = result.data[0].raw_payload;
        setLatestWebhookPayload(latestPayload);
        const fields = Object.keys(latestPayload);
        setAvailableZapierFields(fields);
      }
    } catch (e: any) {
      console.error('Error fetching latest webhook data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newZapierField && latestWebhookPayload) {
      const value = latestWebhookPayload[newZapierField];
      setNewSampleValue(value !== undefined ? String(value) : '');
    }
  }, [newZapierField, latestWebhookPayload]);

  const fetchMappings = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.from('zapier_mappings').select('*, display_name, sample_value').eq('user_id', userId);
      if (error) {
        throw error;
      }
      setMappings(data || []);

      // FIX: Include userId parameter in the webhook API call
      const webhookResponse = await fetch(`/api/dashboard/zapier-data?userId=${userId}`);
      if (webhookResponse.ok) {
        const webhookResult = await webhookResponse.json();
        if (webhookResult.data && webhookResult.data.length > 0) {
          const latestPayload = webhookResult.data[0].raw_payload;
          const allZapierFields = Object.keys(latestPayload);
          const mappedZapierFields = (data || []).map(m => m.zapier_field_name);
          const unmappedFields = allZapierFields.filter(field => !mappedZapierFields.includes(field));
          setAvailableZapierFields(unmappedFields);
          setLatestWebhookPayload(latestPayload);

          const mappedInternalFields = (data || []).map(m => m.internal_field_name);
          const unmappedInternalFields = INTERNAL_FIELDS.filter(field => !mappedInternalFields.includes(field));
          setAvailableInternalFields(unmappedInternalFields);
        }
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMapping = async () => {
    if (newZapierField.trim() === '' || newInternalField.trim() === '' || newDisplayName.trim() === '') return;

    try {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const newMapping: ZapierMapping = {
        zapier_field_name: newZapierField.trim(),
        internal_field_name: newInternalField.trim(),
        display_name: newDisplayName.trim(),
        sample_value: newSampleValue.trim(),
        user_id: userId,
      };

      const { data, error } = await supabase.from('zapier_mappings').insert([newMapping]).select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setMappings([...mappings, data[0]]);
        setNewZapierField('');
        setNewInternalField('');
        setNewDisplayName('');
        setNewSampleValue('');
        setAvailableZapierFields(prevFields => prevFields.filter(field => field !== newMapping.zapier_field_name));
        setAvailableInternalFields(prevFields => prevFields.filter(field => field !== newMapping.internal_field_name));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      const { error } = await supabase.from('zapier_mappings').delete().eq('id', id);
      if (error) {
        throw error;
      }
      setMappings(mappings.filter((mapping) => mapping.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: message,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zapier Field Mappings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Zapier Field Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Zapier Webhook Integration Guide</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">Follow these steps to integrate Zapier with your application.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* New Step 1: Connect Zapier with your software */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              Connect Zapier with your Software
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Before configuring the webhook, ensure you have connected Zapier to your desired software (e.g., ServiceM8, QuickBooks, Xero). This step is crucial for Zapier to access the data you wish to send.</p>
          </div>

          {/* Step 2: Create a Webhook with POST Request and Add URL (formerly part of Step 2) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              Create a Webhook with POST Request and Add URL
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">In Zapier, create a new Zap and select 'Webhooks by Zapier' as the trigger. Choose the 'Catch Hook' event and select 'POST' as the method. Copy the custom webhook URL provided by Zapier and paste it into the 'URL' field of your Zapier 'Webhooks by Zapier (POST)' action in your software.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input readOnly value={`${appUrl}/api/zapier-webhook`} className="flex-1 font-mono text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`${appUrl}/api/zapier-webhook`, 'Webhook URL copied to clipboard!')}
                className="w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ensure you select 'JSON' for the 'Payload Type' in Zapier.</p>
          </div>

          {/* Step 3: Configure Data in Zapier (rephrased and includes User ID) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
              Configure Data in Zapier
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">In Zapier's 'Data' section, add the fields you want to send. It is essential to include a field named <code className="font-mono bg-accent p-1 rounded">user_id</code> with your unique User ID as its value. This ensures your data is correctly attributed to your account. Then, add other relevant fields from your Zapier trigger (e.g., <code className="font-mono bg-accent p-1 rounded">customer_name</code>, <code className="font-mono bg-accent p-1 rounded">order_total</code>).</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input readOnly value={userId || 'Loading...'} className="flex-1 font-mono text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => userId && copyToClipboard(userId, 'User ID copied to clipboard!')}
                disabled={!userId}
                className="w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            {!userId && <p className="text-xs text-red-500 mt-1">User ID not available. Please ensure you are logged in.</p>}
          </div>

          {/* Step 4: Test Your Webhook: Fetch Latest Data (moved from earlier) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span>
              Test Your Webhook: Fetch Latest Data
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">After configuring your Zapier webhook and sending test data, click the button below to fetch the latest payload received by your application. This helps verify that your data is being sent correctly.</p>
            <Button
              onClick={fetchLatestWebhookData}
              disabled={loading}
              className="mt-4 w-full sm:w-auto"
            >
              {loading ? <LoadingSpinner /> : <><RefreshCw className="w-4 h-4 mr-2" /> Fetch Latest Webhook Data</>}
            </Button>
            {latestWebhookPayload && (
              <div className="mt-4 p-4 bg-secondary rounded-md text-xs font-mono overflow-auto max-h-60">
                <h4 className="font-semibold mb-2">Latest Webhook Payload for User:</h4>
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(latestWebhookPayload, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Step 5: Map Zapier Fields to Internal Fields (formerly Step 4) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary text-primary-foreground text-sm font-bold">5</span>
              Map Zapier Fields to Internal Fields
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Use the section below to map the Zapier field names (the 'Keys' you defined in Zapier's 'Data' section) to your internal generic fields (e.g., <code className="font-mono bg-accent p-1 rounded">field1</code>, <code className="font-mono bg-accent p-1 rounded">field2</code>). These mappings tell your application where to store the incoming Zapier data.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zapier Field Mappings</CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">Define how incoming Zapier webhook fields correspond to your internal database fields.</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <Select onValueChange={setNewZapierField} value={newZapierField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Zapier Field" />
              </SelectTrigger>
              <SelectContent>
                {availableZapierFields.length === 0 ? (
                  <SelectItem disabled value="no-data">No available Zapier fields</SelectItem>
                ) : (
                  availableZapierFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select onValueChange={setNewInternalField} value={newInternalField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Internal Field" />
              </SelectTrigger>
              <SelectContent>
                {availableInternalFields.length === 0 ? (
                  <SelectItem disabled value="no-data">No internal fields left to map</SelectItem>
                ) : (
                  availableInternalFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Input
              placeholder="Display Name (e.g., 'Total Revenue')"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full"
            />
            <Input
              placeholder="Sample Value (auto-filled)"
              value={newSampleValue}
              onChange={(e) => setNewSampleValue(e.target.value)}
              className="w-full"
              readOnly
            />
          </div>
          <Button onClick={handleAddMapping} className="w-full md:w-auto mt-2 md:mt-0">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Mapping
          </Button>

          {mappings.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No mappings defined yet. Add your first mapping above.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zapier Field</TableHead>
                    <TableHead>Internal Field</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Sample Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>{mapping.zapier_field_name}</TableCell>
                      <TableCell>{mapping.internal_field_name}</TableCell>
                      <TableCell>{mapping.display_name}</TableCell>
                      <TableCell>{mapping.sample_value}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => mapping.id && handleDeleteMapping(mapping.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}