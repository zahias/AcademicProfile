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
    isPublic: profile?.isPublic ?? true,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(formData);
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={handleSubmit}
              disabled={profileMutation.isPending || !formData.openalexId}
              data-testid="button-save"
            >
              {profileMutation.isPending ? (
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
