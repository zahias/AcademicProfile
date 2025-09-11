import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "./Navigation";
import AdminDashboard from "./AdminDashboard";
import StatsOverview from "./StatsOverview";
import PublicationAnalytics from "./PublicationAnalytics";
import ResearchTopics from "./ResearchTopics";
import Publications from "./Publications";
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
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Profile Image Section */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start mb-8 lg:mb-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-2">
                  <img 
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
                    alt="Professional portrait" 
                    className="w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    data-testid="img-profile-photo"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="lg:col-span-8 text-center lg:text-left text-white">
              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight" data-testid="text-display-name">
                  {profile?.displayName || 'Researcher Profile'}
                </h1>
                <p className="text-xl sm:text-2xl mb-4 text-white/90 font-light" data-testid="text-title">
                  {profile?.title || 'Research Professional'}
                </p>
                
                {/* Quick Stats Pills */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <span className="text-sm font-medium">✨ Verified Researcher</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <span className="text-sm font-medium">🎓 Academic Professional</span>
                  </div>
                </div>
              </div>
              
              {profile?.bio && (
                <p className="text-lg sm:text-xl text-white/85 max-w-3xl mx-auto lg:mx-0 mb-8 leading-relaxed" data-testid="text-bio">
                  {profile.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <a 
                  href={`https://openalex.org/people/${profile?.openalexId}`} 
                  target="_blank" 
                  className="group bg-white/15 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/25 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105"
                  data-testid="link-openalex"
                >
                  <i className="fas fa-external-link-alt mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                  View on OpenAlex
                </a>
                {profile?.cvUrl && (
                  <a 
                    href={profile.cvUrl} 
                    target="_blank" 
                    className="group bg-white text-primary px-6 py-3 rounded-lg hover:bg-white/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    data-testid="link-cv"
                  >
                    <i className="fas fa-file-pdf mr-2 text-red-600 group-hover:scale-110 transition-transform duration-300"></i>
                    Download CV
                  </a>
                )}
                <button className="group bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40">
                  <i className="fas fa-envelope mr-2 group-hover:scale-110 transition-transform duration-300"></i>
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </section>

      <StatsOverview openalexId={profile?.openalexId || ''} />
      <PublicationAnalytics openalexId={profile?.openalexId || ''} />
      <ResearchTopics openalexId={profile?.openalexId || ''} />
      <Publications openalexId={profile?.openalexId || ''} />

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
