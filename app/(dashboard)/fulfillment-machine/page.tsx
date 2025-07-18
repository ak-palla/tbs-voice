"use client";

import { useState, useEffect, useRef } from "react";
<<<<<<< HEAD
import { Loader2, ExternalLink, Edit, Save, PlusCircle, X, Code, Hand, ZoomIn, Camera, Upload, Image, FileCode2, Check, SwitchCamera } from "lucide-react";
=======
import { Loader2, ExternalLink, Edit, Save, X, Code, Hand, ZoomIn, Camera, Upload, Image, FileCode2, Check, SwitchCamera, Settings } from "lucide-react";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
import { createClient } from "@/utils/supabase/client";
import { getTeamId } from "@/utils/supabase/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
<<<<<<< HEAD
=======
import MachinePlanner from "./components/machine-planner";
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

type MachineData = {
  id: string;
  user_id: string;
  enginename: string;
  enginetype: string;
  description: string;
  figma_link: string | null;
  figma_embed: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
<<<<<<< HEAD
=======
  triggeringevents: { value: string }[];
  endingevent: { value: string }[];
  actionsactivities: { value: string }[];
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
};

export default function FulfillmentMachinePage() {
  const [machineData, setMachineData] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [figmaLink, setFigmaLink] = useState("");
  const [figmaEmbed, setFigmaEmbed] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<"image" | "figma">("image");
=======
  const [activeDesignTab, setActiveDesignTab] = useState<"image" | "figma">("image");
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const [figmaMode, setFigmaMode] = useState<"link" | "embed">("link");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
<<<<<<< HEAD
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const [showImageWhenFigmaExists, setShowImageWhenFigmaExists] = useState(false);
=======
  const [showImageWhenFigmaExists, setShowImageWhenFigmaExists] = useState(false);
  const [mainActiveTab, setMainActiveTab] = useState("design");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  useEffect(() => {
    fetchMachineData();
  }, []);

  useEffect(() => {
    if (machineData) {
      setFigmaLink(machineData.figma_link || "");
      setFigmaEmbed(machineData.figma_embed || "");
      setImagePreview(machineData.image_url || null);
      
      // Set the active tab based on what data is available
      if (machineData.figma_link || machineData.figma_embed) {
<<<<<<< HEAD
        setActiveTab("figma");
        setFigmaMode(machineData.figma_embed ? "embed" : "link");
      } else {
        setActiveTab("image");
=======
        setActiveDesignTab("figma");
        setFigmaMode(machineData.figma_embed ? "embed" : "link");
      } else {
        setActiveDesignTab("image");
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
      }
    }
  }, [machineData]);

  const fetchMachineData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const teamId = await getTeamId(supabase, user.id);
      
      const { data, error } = await supabase
        .from("machines")
        .select("*")
        .eq("user_id", teamId)
        .eq("enginetype", "FULFILLMENT")
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setMachineData(data);
      } else {
        setError("No fulfillment machine found.");
      }
    } catch (error) {
      console.error("Error fetching fulfillment machine data:", error);
      setError("Failed to load fulfillment machine data");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !machineData?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${machineData.id}_${Date.now()}.${fileExt}`;
      const filePath = `fulfillment_machines/${fileName}`;

      // Create a temporary preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('machines')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload image');
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('machines')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Could not get public URL for the uploaded image.');
      }

      // Update the machine record
      const { error: updateError } = await supabase
        .from('machines')
        .update({ image_url: publicUrl })
        .eq('id', machineData.id);

      if (updateError) {
        // Try to clean up the orphaned file
        await supabase.storage.from('machines').remove([filePath]);
        throw new Error(updateError.message || 'Failed to update machine with image URL');
      }

      // Update local state
      setMachineData(prev => prev ? { ...prev, image_url: publicUrl } : null);
      setUploadSuccess(true);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      setImagePreview(machineData.image_url || null);
    } finally {
      setUploading(false);
    }
  };

  const getFigmaEmbedUrl = (figmaLink: string) => {
    // Convert normal Figma link to embed URL
    if (figmaLink.includes("figma.com/file/")) {
      // Extract the file ID and other parts from the URL
      const fileIdMatch = figmaLink.match(/figma\.com\/file\/([^\/]+)(\/.*)?/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileIdMatch[1]}`;
      }
    }
    
    // If it's already an embed URL or we can't parse it, return as is
    return figmaLink;
  };

  const extractSrcFromEmbed = (embedCode: string): string | null => {
    // Extract the src attribute from an iframe embed code
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : null;
  };

<<<<<<< HEAD
=======
  const getFigmaEmbedSrc = (embedCode: string): string | null => {
    // Extract the src from embed code for iframe usage
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/);
    return srcMatch ? srcMatch[1] : null;
  };

>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
  const handleSaveFigma = async () => {
    if (!machineData?.id) return;

    try {
      setIsSaving(true);
      
      const updateData: {
        figma_link?: string | null;
        figma_embed?: string | null;
      } = {};
      
      // Update based on the active tab and figma mode
<<<<<<< HEAD
      if (activeTab === "figma") {
=======
      if (activeDesignTab === "figma") {
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
        if (figmaMode === "link") {
          updateData.figma_link = figmaLink.trim() || null;
        } else {
          updateData.figma_embed = figmaEmbed.trim() || null;
        }
      }
      
      const { error } = await supabase
        .from("machines")
        .update(updateData)
        .eq("id", machineData.id);
        
      if (error) throw error;
      
      // Refresh data and exit edit mode
      await fetchMachineData();
      setIsEditing(false);
<<<<<<< HEAD
    } catch (error) {
      console.error("Error saving Figma data:", error);
=======
      toast.success('Figma design saved successfully');
    } catch (error) {
      console.error("Error saving Figma data:", error);
      toast.error('Failed to save Figma design');
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
    } finally {
      setIsSaving(false);
    }
  };

  // For the UI display, check if we have any content
  const hasFigmaContent = !!machineData?.figma_link || !!machineData?.figma_embed;
  const hasImageContent = !!machineData?.image_url;
<<<<<<< HEAD
  const hasContent = hasFigmaContent || hasImageContent;
=======
  const hasDesignContent = hasFigmaContent || hasImageContent;
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a

  return (
    <div className="flex flex-col h-[calc(100vh-70px)]">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
<<<<<<< HEAD
      ) : error || (!hasContent && !isEditing) ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              {!machineData 
                ? "Fulfillment machine not found" 
                : "No design or image added yet"}
            </h2>
            <p className="text-gray-600 mb-6">
              {!machineData
                ? error
                : "Upload an image of your fulfillment machine design to get started."}
            </p>
            
            {!machineData ? (
              <Button 
                asChild
                className="bg-purple-600 hover:bg-purple-700"
              >
                <a href="/fulfillment-machine-planner">
                  Go to Fulfillment Machine Planner
                </a>
              </Button>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("image");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 mb-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                <div className="flex items-center">
                  <div className="border-t border-gray-200 w-16"></div>
                  <span className="px-3 text-sm text-gray-500">or</span>
                  <div className="border-t border-gray-200 w-16"></div>
                </div>
                <Button 
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab("figma");
                    setFigmaMode("embed");
                  }}
                  variant="outline"
                  className="border-purple-200 text-purple-700"
                >
                  <FileCode2 className="w-4 h-4 mr-2" />
                  Add Figma Design
                </Button>
                <Button 
                  asChild
                  variant="ghost"
                  className="mt-4"
                >
                  <a href="/fulfillment-machine-planner">
                    Back to Planner
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : isEditing ? (
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              {hasContent ? "Edit Design" : "Upload Your Design"}
            </h2>
            
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "image" | "figma")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="image" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="figma" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                  <FileCode2 className="h-4 w-4 mr-2" />
                  Figma Design
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="image" className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                     onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Fulfillment machine preview" 
                        className="mx-auto max-h-[200px] object-contain rounded-md"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition rounded-md">
                        <div className="bg-white rounded-full p-2">
                          <Camera className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-purple-500 mb-3" />
                      <p className="text-sm text-gray-700 font-medium">Click to upload an image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG or SVG (max. 10MB)</p>
                    </>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="machine-image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
                
                {uploading && (
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="flex items-center p-3 rounded-md bg-green-50 border border-green-100 text-green-800 text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    <span>We've received your image! Our team will convert it to a Figma design and update it here once completed.</span>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="figma">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">Figma Design</h3>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={figmaMode === "link" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}
                        onClick={() => setFigmaMode("link")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Link
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={figmaMode === "embed" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}
                        onClick={() => setFigmaMode("embed")}
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Embed
                      </Button>
                    </div>
                  </div>
                  
                  {figmaMode === "link" ? (
                    <div className="space-y-3">
                      <Input
                        id="figma-link"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="https://www.figma.com/file/..."
                        className="w-full text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Paste a link to your Figma file (e.g., https://www.figma.com/file/...)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Textarea
                        id="figma-embed"
                        value={figmaEmbed}
                        onChange={(e) => setFigmaEmbed(e.target.value)}
                        placeholder="<iframe src='https://embed.figma.com/...' />"
                        className="w-full min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Paste the iframe embed code from Figma's share modal (Share &gt; Embed &gt; Copy code)
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  if (machineData?.figma_link) {
                    setFigmaLink(machineData.figma_link);
                  }
                  if (machineData?.figma_embed) {
                    setFigmaEmbed(machineData.figma_embed);
                  }
                  setImagePreview(machineData?.image_url || null);
                  setUploadSuccess(false);
                  setShowImageWhenFigmaExists(false);
                }}
                className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                size="sm"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Cancel</span>
              </Button>
              {activeTab === "figma" && (
                <Button
                  onClick={handleSaveFigma}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm h-8 sm:h-9"
                  disabled={isSaving || (figmaMode === "link" ? !figmaLink.trim() : !figmaEmbed.trim())}
                  size="sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  )}
                  <span>Save</span>
                </Button>
              )}
            </div>
=======
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Fulfilment machine not found
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          </div>
        </div>
      ) : (
        <>
<<<<<<< HEAD
          {/* Header with machine name and edit button */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-2 sm:mb-0">
              <h1 className="text-sm sm:text-xl font-semibold text-purple-800">
                {machineData?.enginename || "Fulfillment Machine"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {showImageWhenFigmaExists ? "Custom Image" : hasFigmaContent ? "Figma Design" : "Custom Image"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {hasFigmaContent && hasImageContent && (
                <Button
                  variant="outline"
                  onClick={() => setShowImageWhenFigmaExists(!showImageWhenFigmaExists)}
                  className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                  size="sm"
                >
                  <SwitchCamera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Switch to {showImageWhenFigmaExists ? "Figma Design" : "Image View"}</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                size="sm"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span>Edit {showImageWhenFigmaExists || !hasFigmaContent ? "Image" : "Design"}</span>
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                size="sm"
              >
                <a href="/fulfillment-machine-planner">
                  <span>Back to Planner</span>
                </a>
              </Button>
              
              {hasFigmaContent && !showImageWhenFigmaExists && (
                <Button
                  asChild
                  className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <a 
                    href={
                      machineData?.figma_link || 
                      extractSrcFromEmbed(machineData?.figma_embed || "") || 
                      "#"
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                    
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>Open in Figma</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* Figma embed or image display */}
          <div className="flex-1 bg-gray-100 relative">
            {hasFigmaContent && !showImageWhenFigmaExists && (
              <div className="absolute top-3 left-3 bg-white/90 rounded-lg -md p-2 z-10 text-xs border border-gray-200 max-w-[180px] sm:max-w-[220px]">
                <h4 className="font-medium text-gray-900 text-xs mb-1.5 px-1">Figma Navigation</h4>
                <ul className="space-y-1.5">
                  <li className="flex items-center text-xs">
                    <Hand className="h-3 w-3 mr-1.5 text-purple-600 flex-shrink-0" />
                    <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Click</kbd> + drag to pan</span>
                  </li>
                  <li className="flex items-center text-xs">
                    <ZoomIn className="h-3 w-3 mr-1.5 text-purple-600 flex-shrink-0" />
                    <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + scroll to zoom</span>
                  </li>
                </ul>
              </div>
            )}

            {(hasImageContent && (!hasFigmaContent || showImageWhenFigmaExists)) ? (
              <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                <img 
                  src={machineData?.image_url!} 
                  alt={machineData?.enginename || "Fulfillment Machine"} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : machineData?.figma_embed ? (
              <div 
                className="w-full h-full" 
                dangerouslySetInnerHTML={{ 
                  __html: machineData.figma_embed
                    // Remove width and height attributes
                    .replace(/width="[^"]*"/g, 'width="100%"')
                    .replace(/height="[^"]*"/g, 'height="100%"')
                    // Add or update style attribute with full dimensions
                    .replace(
                      /<iframe(.*?)style="([^"]*)"/g, 
                      '<iframe$1style="$2; width:100%; height:100%; border:1px solid rgba(0,0,0,0.1);"'
                    )
                    // Add style if no style attribute exists
                    .replace(
                      /<iframe((?!style=).)*?>/g,
                      '<iframe$1 style="width:100%; height:100%; border:1px solid rgba(0,0,0,0.1);">'
                    )
                }}
              />
            ) : machineData?.figma_link ? (
              <iframe
                className="w-full h-full"
                style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                src={getFigmaEmbedUrl(machineData.figma_link)}
                allowFullScreen
                title="Fulfillment Machine Figma Design"
              />
            ) : null}
=======
          {/* Header with machine name and main tab navigation */}
          <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-purple-800">
                  {machineData?.enginename || "Fulfilment Machine"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Manage your fulfilment machine design and details
                </p>
              </div>
            </div>
            
            {/* Main Tab Navigation */}
            <Tabs value={mainActiveTab} onValueChange={setMainActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto max-w-[400px] bg-white border-b border-gray-200 p-2 w-full h-full mb-2 gap-2">
                <TabsTrigger value="design" className="bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                  <Image className="h-4 w-4 mr-2" />
                  Design
                </TabsTrigger>
                <TabsTrigger value="details" className="bg-gray-50 hover:bg-gray-100 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Planner
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 relative">
            {/* Design Tab Content */}
            <div className={`absolute inset-0 ${mainActiveTab === "design" ? "block" : "hidden"}`}>
              {!hasDesignContent && !isEditing ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
                  <div className="max-w-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                      No design or image added yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Upload an image of your fulfilment machine design to get started.
                    </p>
                    
                    <div className="flex flex-col items-center space-y-4">
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setActiveDesignTab("image");
                        }}
                        className="bg-purple-600 hover:bg-purple-700 mb-2"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      <div className="flex items-center">
                        <div className="border-t border-gray-200 w-16"></div>
                        <span className="px-3 text-sm text-gray-500">or</span>
                        <div className="border-t border-gray-200 w-16"></div>
                      </div>
                      <Button 
                        onClick={() => {
                          setIsEditing(true);
                          setActiveDesignTab("figma");
                          setFigmaMode("embed");
                        }}
                        variant="outline"
                        className="border-purple-200 text-purple-700"
                      >
                        <FileCode2 className="w-4 h-4 mr-2" />
                        Add Figma Design
                      </Button>
                    </div>
                  </div>
                </div>
              ) : isEditing ? (
                <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 h-full">
                  <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                      {hasDesignContent ? "Edit Design" : "Upload Your Design"}
                    </h2>
                    
                    <Tabs 
                      value={activeDesignTab} 
                      onValueChange={(value) => setActiveDesignTab(value as "image" | "figma")}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="image" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </TabsTrigger>
                        <TabsTrigger value="figma" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                          <FileCode2 className="h-4 w-4 mr-2" />
                          Figma Design
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="image" className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                             onClick={() => fileInputRef.current?.click()}>
                          {imagePreview ? (
                            <div className="relative w-full">
                              <img 
                                src={imagePreview} 
                                alt="Fulfillment machine preview" 
                                className="mx-auto max-h-[200px] object-contain rounded-md"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition rounded-md">
                                <div className="bg-white rounded-full p-2">
                                  <Camera className="h-5 w-5 text-purple-600" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-10 w-10 text-purple-500 mb-3" />
                              <p className="text-sm text-gray-700 font-medium">Click to upload an image</p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG or SVG (max. 10MB)</p>
                            </>
                          )}
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            id="machine-image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                          />
                        </div>
                        
                        {uploading && (
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        )}

                        {uploadSuccess && (
                          <div className="flex items-center p-3 rounded-md bg-green-50 border border-green-100 text-green-800 text-sm">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            <span>Image uploaded successfully!</span>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="figma">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-sm">Figma Design</h3>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={figmaMode === "link" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}
                                onClick={() => setFigmaMode("link")}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Link
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={figmaMode === "embed" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}
                                onClick={() => setFigmaMode("embed")}
                              >
                                <Code className="h-3 w-3 mr-1" />
                                Embed
                              </Button>
                            </div>
                          </div>
                          
                          {figmaMode === "link" ? (
                            <div className="space-y-3">
                              <Input
                                id="figma-link"
                                value={figmaLink}
                                onChange={(e) => setFigmaLink(e.target.value)}
                                placeholder="https://www.figma.com/file/..."
                                className="w-full text-xs sm:text-sm"
                              />
                              <p className="text-xs text-gray-500">
                                Paste a link to your Figma file (e.g., https://www.figma.com/file/...)
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Textarea
                                id="figma-embed"
                                value={figmaEmbed}
                                onChange={(e) => setFigmaEmbed(e.target.value)}
                                placeholder="<iframe src='https://embed.figma.com/...' />"
                                className="w-full min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm"
                              />
                              <p className="text-xs text-gray-500">
                                Paste the iframe embed code from Figma's share modal (Share &gt; Embed &gt; Copy code)
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          if (machineData?.figma_link) {
                            setFigmaLink(machineData.figma_link);
                          }
                          if (machineData?.figma_embed) {
                            setFigmaEmbed(machineData.figma_embed);
                          }
                          setImagePreview(machineData?.image_url || null);
                          setUploadSuccess(false);
                          setShowImageWhenFigmaExists(false);
                        }}
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                        size="sm"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span>Cancel</span>
                      </Button>
                      {activeDesignTab === "figma" && (
                        <Button
                          onClick={handleSaveFigma}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm h-8 sm:h-9"
                          disabled={isSaving || (figmaMode === "link" ? !figmaLink.trim() : !figmaEmbed.trim())}
                          size="sm"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          )}
                          <span>Save</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Design View Header */}
                  <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between flex-shrink-0">
                    <div className="mb-2 sm:mb-0">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {showImageWhenFigmaExists ? "Custom Image" : hasFigmaContent ? "Figma Design" : "Custom Image"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {hasFigmaContent && hasImageContent && (
                        <Button
                          variant="outline"
                          onClick={() => setShowImageWhenFigmaExists(!showImageWhenFigmaExists)}
                          className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                          size="sm"
                        >
                          <SwitchCamera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span>Switch to {showImageWhenFigmaExists ? "Figma Design" : "Image View"}</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 border-purple-200 text-purple-700 hover:bg-purple-50"
                        size="sm"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span>Edit {showImageWhenFigmaExists || !hasFigmaContent ? "Image" : "Design"}</span>
                      </Button>
                      
                      {hasFigmaContent && !showImageWhenFigmaExists && (
                        <Button
                          asChild
                          className="text-xs sm:text-sm h-6 sm:h-9 px-1 sm:px-3 bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <a 
                            href={
                              machineData?.figma_link || 
                              extractSrcFromEmbed(machineData?.figma_embed || "") || 
                              "#"
                            } 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span>Open in Figma</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Design Content */}
                  <div className="flex-1 bg-gray-100 relative">
                    {hasFigmaContent && !showImageWhenFigmaExists && (
                      <div className="absolute top-3 left-3 bg-white/90 rounded-lg p-2 z-10 text-xs border border-gray-200 max-w-[180px] sm:max-w-[220px]">
                        <h4 className="font-medium text-gray-900 text-xs mb-1.5 px-1">Figma Navigation</h4>
                        <ul className="space-y-1.5">
                          <li className="flex items-center text-xs">
                            <Hand className="h-3 w-3 mr-1.5 text-purple-600 flex-shrink-0" />
                            <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Click</kbd> + drag to pan</span>
                          </li>
                          <li className="flex items-center text-xs">
                            <ZoomIn className="h-3 w-3 mr-1.5 text-purple-600 flex-shrink-0" />
                            <span><kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + scroll to zoom</span>
                          </li>
                        </ul>
                      </div>
                    )}

                    {(hasImageContent && (!hasFigmaContent || showImageWhenFigmaExists)) ? (
                      <div className="w-full h-full flex items-center justify-center p-4 sm:p-8">
                        <img 
                          src={machineData?.image_url!} 
                          alt={machineData?.enginename || "Fulfillment Machine"} 
                          className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                        />
                      </div>
                    ) : machineData?.figma_embed ? (
                      <iframe
                        className="w-full h-2 min-h-[calc(100vh-300px)]"
                        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                        src={getFigmaEmbedSrc(machineData.figma_embed) || ""}
                        allowFullScreen
                        title="Fulfillment Machine Figma Design"
                      />
                    ) : machineData?.figma_link ? (
                      <iframe
                        className="w-full h-full"
                        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
                        src={getFigmaEmbedUrl(machineData.figma_link)}
                        allowFullScreen
                        title="Fulfillment Machine Figma Design"
                      />
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Details Tab Content */}
            <div className={`absolute inset-0 ${mainActiveTab === "details" ? "block" : "hidden"}`}>
              <div className="flex-1">
                <div className="mx-auto">
                  <MachinePlanner onDataChange={fetchMachineData} />
                </div>
              </div>
            </div>
>>>>>>> 07a932c910494f776eec651bd1a2a65681669a0a
          </div>
        </>
      )}
    </div>
  );
} 