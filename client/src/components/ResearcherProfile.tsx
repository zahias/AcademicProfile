import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "./Navigation";
import AdminDashboard from "./AdminDashboard";
import StatsOverview from "./StatsOverview";
import ResearchTopics from "./ResearchTopics";
import Publications from "./Publications";
import CareerTimeline from "./CareerTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ResearcherProfile } from "@shared/schema";

export default function ResearcherProfile() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  const { data: profile } = useQuery<ResearcherProfile | null>({
    queryKey: ["/api/researcher/profile"],
    retry: false,
  });

  // If no profile exists, show setup form
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation onAdminClick={() => setShowAdminModal(true)} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to Your Research Profile</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  To get started, we need to connect your profile to your OpenAlex researcher ID. 
                  This will allow us to automatically sync your publications, citations, and research data.
                </p>
                
                <div className="bg-muted rounded-lg p-6 mb-8">
                  <h3 className="font-semibold mb-2">How to find your OpenAlex ID:</h3>
                  <ol className="text-sm text-muted-foreground text-left list-decimal list-inside space-y-1">
                    <li>Visit <a href="https://openalex.org" target="_blank" className="text-primary hover:underline">OpenAlex.org</a></li>
                    <li>Search for your name in the "Authors" section</li>
                    <li>Click on your profile to view your OpenAlex ID (starts with "A")</li>
                    <li>Copy the ID and paste it in the admin panel</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={() => setShowAdminModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-setup-profile"
                >
                  Set Up Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdminDashboard 
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          profile={null}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onAdminClick={() => setShowAdminModal(true)} />
      
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-primary-foreground">
            <img 
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
              alt="Professional portrait" 
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-primary-foreground/20 shadow-xl"
              data-testid="img-profile-photo"
            />
            
            <h1 className="text-5xl font-bold mb-2" data-testid="text-display-name">
              {profile?.displayName || 'Researcher Profile'}
            </h1>
            <p className="text-xl mb-4 text-primary-foreground/90" data-testid="text-title">
              {profile?.title || 'Research Professional'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a 
                href={`https://openalex.org/people/${profile?.openalexId}`} 
                target="_blank" 
                className="bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full hover:bg-primary-foreground/30 transition-colors"
                data-testid="link-openalex"
              >
                <i className="fas fa-external-link-alt mr-2"></i>OpenAlex
              </a>
              {profile?.cvUrl && (
                <a 
                  href={profile.cvUrl} 
                  target="_blank" 
                  className="bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-full hover:bg-primary-foreground/30 transition-colors"
                  data-testid="link-cv"
                >
                  <i className="fas fa-file-pdf mr-2"></i>CV
                </a>
              )}
            </div>
            
            {profile?.bio && (
              <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto" data-testid="text-bio">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </section>

      <StatsOverview openalexId={profile?.openalexId || ''} />
      <ResearchTopics openalexId={profile?.openalexId || ''} />
      <Publications openalexId={profile?.openalexId || ''} />
      <CareerTimeline openalexId={profile?.openalexId || ''} />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">
                {profile?.displayName || 'Research Profile'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {profile?.bio || 'Advancing research with real-world impact.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#research" className="text-muted-foreground hover:text-accent transition-colors">Research Areas</a></li>
                <li><a href="#publications" className="text-muted-foreground hover:text-accent transition-colors">Publications</a></li>
                <li><a href="#timeline" className="text-muted-foreground hover:text-accent transition-colors">Career Timeline</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Data Source</h3>
              <p className="text-muted-foreground text-sm mb-2">
                Data automatically synchronized with OpenAlex API
              </p>
              <p className="text-muted-foreground text-sm">
                Last updated: {profile?.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Research Profile Platform. Powered by OpenAlex API.
            </p>
          </div>
        </div>
      </footer>

      <AdminDashboard 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        profile={profile}
      />
    </div>
  );
}
