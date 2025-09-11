import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Upload, Search, CheckCircle, ExternalLink } from "lucide-react";
import type { ResearcherProfile } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ResearcherProfile | null;
}

export default function AdminDashboard({ isOpen, onClose, profile }: AdminDashboardProps) {
  const [formData, setFormData] = useState({
    openalexId: profile?.openalexId || '',
    displayName: profile?.displayName || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    cvUrl: profile?.cvUrl || '',
    currentAffiliation: profile?.currentAffiliation || '',
    currentPosition: profile?.currentPosition || '',
    currentAffiliationUrl: profile?.currentAffiliationUrl || '',
    currentAffiliationStartDate: profile?.currentAffiliationStartDate || '',
    isPublic: profile?.isPublic ?? true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string | null>(null);
  const [searchingOpenAlex, setSearchingOpenAlex] = useState(false);
  const [openalexPreview, setOpenalexPreview] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to search OpenAlex by ID and preview data
  const searchOpenAlex = async (openalexId: string) => {
    if (!openalexId.trim()) {
      setOpenalexPreview(null);
      return;
    }

    setSearchingOpenAlex(true);
    try {
      const data = await apiRequest("GET", `/api/openalex/search/${openalexId.trim()}`);
      setOpenalexPreview(data);
      
      // Auto-fill form fields with OpenAlex data
      if (data) {
        setFormData(prev => ({
          ...prev,
          displayName: data.display_name || prev.displayName,
          // Don't overwrite other fields if they already have values
        }));
      }
    } catch (error) {
      console.error("Error searching OpenAlex:", error);
      setOpenalexPreview(null);
      toast({
        title: "Search Error",
        description: "Could not find researcher with that OpenAlex ID",
        variant: "destructive",
      });
    } finally {
      setSearchingOpenAlex(false);
    }
  };

  const syncMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/researcher/sync");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Research data synced successfully",
      });
      // Invalidate all related researcher data caches
      queryClient.invalidateQueries({ queryKey: ["/api/researcher"] });
      if (profile?.openalexId) {
        queryClient.invalidateQueries({ queryKey: [`/api/researcher/${profile.openalexId}/data`] });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to sync research data",
        variant: "destructive",
      });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (profile) {
        await apiRequest("PUT", `/api/researcher/profile/${profile.id}`, data);
      } else {
        await apiRequest("POST", "/api/researcher/profile", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      // Invalidate all related researcher data caches
      queryClient.invalidateQueries({ queryKey: ["/api/researcher"] });
      if (profile?.openalexId) {
        queryClient.invalidateQueries({ queryKey: [`/api/researcher/${profile.openalexId}/data`] });
      }
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleCvUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      
      // The upload URL used for the upload can be derived from uppy's response
      const uploadUrl = (uploadedFile as any).uploadURL || (uploadedFile.response as any)?.url;
      
      if (uploadUrl) {
        // Complete the upload process by calling our backend
        apiRequest("PUT", "/api/upload/cv/complete", { uploadURL: uploadUrl })
          .then((response: any) => {
            const objectPath = response.objectPath || uploadUrl;
            setUploadedCvUrl(objectPath);
            toast({
              title: "Success",
              description: "CV uploaded successfully",
            });
          })
          .catch((error) => {
            console.error("Error completing CV upload:", error);
            // If completion fails, still use the upload URL as backup
            setUploadedCvUrl(uploadUrl);
            toast({
              title: "Warning", 
              description: "CV uploaded but metadata may be incomplete",
              variant: "destructive",
            });
          });
      } else {
        toast({
          title: "Error", 
          description: "Upload completed but URL not found",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      });
    }
  };

  const getCvUploadParams = async () => {
    try {
      const response = await apiRequest("POST", "/api/upload/cv/url", {
        filename: "cv.pdf"
      }) as unknown as { uploadURL: string };
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Error getting CV upload URL:", error);
      toast({
        title: "Error",
        description: "Failed to get upload URL. Please check your connection.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Use uploaded CV URL if available
    if (uploadedCvUrl) {
      finalFormData.cvUrl = uploadedCvUrl;
    }
    
    // Convert empty strings to null for date fields to prevent database errors
    if (finalFormData.currentAffiliationStartDate === '') {
      finalFormData.currentAffiliationStartDate = null;
    }
    
    profileMutation.mutate(finalFormData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" data-testid="modal-admin">
      <div className="flex items-center justify-center min-h-full p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Admin Dashboard</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-admin"
              >
                <i className="fas fa-times text-xl"></i>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="openalexId">OpenAlex ID *</Label>
                <Input
                  id="openalexId"
                  value={formData.openalexId}
                  onChange={(e) => setFormData({ ...formData, openalexId: e.target.value })}
                  placeholder="A5056485484 (without https://openalex.org/)"
                  required
                  data-testid="input-openalex-id"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find your ID at <a href="https://openalex.org" target="_blank" className="text-primary hover:underline">OpenAlex.org</a>
                </p>
              </div>
              
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Dr. John Doe"
                  data-testid="input-display-name"
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title/Position</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Senior Researcher in Computer Science"
                  data-testid="input-title"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description of your research focus and interests..."
                  rows={4}
                  data-testid="textarea-bio"
                />
              </div>

              <Separator className="my-6" />
              
              {/* CV Upload Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">CV & Documents</h3>
                
                <div>
                  <Label>Upload CV (PDF)</Label>
                  <div className="mt-2">
                    {(formData.cvUrl || uploadedCvUrl) && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded">
                        <i className="fas fa-file-pdf text-red-600"></i>
                        <span className="text-sm">Current CV uploaded</span>
                        <a 
                          href={uploadedCvUrl || formData.cvUrl} 
                          target="_blank" 
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </a>
                      </div>
                    )}
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10 * 1024 * 1024} // 10MB
                      onGetUploadParameters={getCvUploadParams}
                      onComplete={handleCvUploadComplete}
                      buttonClassName="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload CV (PDF)
                    </ObjectUploader>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a PDF file of your CV (max 10MB)
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cvUrl">Or enter CV URL</Label>
                  <Input
                    id="cvUrl"
                    value={formData.cvUrl}
                    onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                    placeholder="https://example.com/my-cv.pdf"
                    data-testid="input-cv-url"
                  />
                </div>
              </div>

              <Separator className="my-6" />
              
              {/* Current Affiliation Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Current Affiliation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentAffiliation">Institution Name</Label>
                    <Input
                      id="currentAffiliation"
                      value={formData.currentAffiliation}
                      onChange={(e) => setFormData({ ...formData, currentAffiliation: e.target.value })}
                      placeholder="University of Example"
                      data-testid="input-current-affiliation"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="Associate Professor"
                      data-testid="input-current-position"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentAffiliationUrl">Institution Website</Label>
                    <Input
                      id="currentAffiliationUrl"
                      value={formData.currentAffiliationUrl}
                      onChange={(e) => setFormData({ ...formData, currentAffiliationUrl: e.target.value })}
                      placeholder="https://university.edu"
                      data-testid="input-current-affiliation-url"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentAffiliationStartDate">Start Date</Label>
                    <Input
                      id="currentAffiliationStartDate"
                      type="date"
                      value={formData.currentAffiliationStartDate}
                      onChange={(e) => setFormData({ ...formData, currentAffiliationStartDate: e.target.value })}
                      data-testid="input-current-affiliation-start-date"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-border"
                  data-testid="checkbox-public"
                />
                <Label htmlFor="isPublic">Make profile public</Label>
              </div>
            </form>
            
            {/* Data Sync Section */}
            {profile && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Research Data Sync</h3>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Last sync</span>
                    <span className="text-sm text-accent">
                      {profile.lastSyncedAt 
                        ? new Date(profile.lastSyncedAt).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <Button
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                    className="w-full"
                    data-testid="button-sync-data"
                  >
                    {syncMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync mr-2"></i>
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Export Section */}
                <div className="bg-primary/5 rounded-lg p-4 mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Export Profile
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a standalone HTML website of your research profile that you can host anywhere.
                  </p>
                  <Button
                    onClick={() => {
                      window.open(`/api/researcher/${profile.openalexId}/export`, '_blank');
                    }}
                    variant="outline" 
                    className="w-full"
                    data-testid="button-export-profile"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Download Static Website
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          
          <div className="flex justify-end space-x-3 p-6 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              form="profile-form"
              disabled={profileMutation.isPending || isUploading || !formData.openalexId}
              data-testid="button-save"
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Uploading CV...
                </>
              ) : profileMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
