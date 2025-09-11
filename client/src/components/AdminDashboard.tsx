import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ResearcherProfile } from "@shared/schema";

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

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/researcher/sync");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Research data synced successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/researcher"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/researcher"] });
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

  const handleCvUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload CV');
      }
      
      const result = await response.json();
      return result.url;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = { ...formData };
    
    // Upload CV if a new file is selected
    if (cvFile) {
      try {
        const cvUrl = await handleCvUpload(cvFile);
        finalFormData.cvUrl = cvUrl;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload CV",
          variant: "destructive",
        });
        return;
      }
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
                  <Label htmlFor="cv-upload">Upload CV (PDF)</Label>
                  <div className="mt-2">
                    {formData.cvUrl && !cvFile && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded">
                        <i className="fas fa-file-pdf text-red-600"></i>
                        <span className="text-sm">Current CV uploaded</span>
                        <a 
                          href={formData.cvUrl} 
                          target="_blank" 
                          className="text-primary hover:underline text-sm"
                        >
                          View
                        </a>
                      </div>
                    )}
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      data-testid="input-cv-upload"
                    />
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
