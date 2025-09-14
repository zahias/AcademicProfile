import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "./Navigation";
import StatsOverview from "./StatsOverview";
import PublicationAnalytics from "./PublicationAnalytics";
import ResearchTopics from "./ResearchTopics";
import Publications from "./Publications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, GraduationCap, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResearcherProfile } from "@shared/schema";

export default function ResearcherProfile() {
  const { id } = useParams();
  
  const { data: researcherData, isLoading, error } = useQuery<{
    profile: any;
    researcher: any;
    topics: any[];
    publications: any[];
    affiliations: any[];
    lastSynced: string;
  } | null>({
    queryKey: [`/api/researcher/${id}/data`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Skeleton className="h-8 w-64 mx-auto mb-4" />
                <Skeleton className="h-4 w-96 mx-auto mb-8" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If no profile exists, show message
  if (error || !researcherData || !researcherData.profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">No Profile Available</h1>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  The researcher profile you're looking for doesn't exist or isn't public yet.
                </p>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { profile, researcher } = researcherData;
  const openalexId = profile.openalexId || id || '';

  return (
    <div className="min-h-screen bg-background" data-testid="page-researcher-profile">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <section className="hero-banner min-h-[85vh] flex items-center">
        {/* Enhanced Background pattern overlay */}
        <div className="hero-pattern"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            {/* Profile Image Section */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start mb-12 lg:mb-0">
              <div className="profile-image-container">
                <div className="profile-image-glow"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500" 
                    alt="Professional portrait" 
                    className="w-44 h-44 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    data-testid="img-profile-photo"
                  />
                  <div className="profile-badge absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="lg:col-span-8 text-center lg:text-left text-white space-y-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent" data-testid="text-display-name">
                    {profile.displayName || researcher.display_name || 'Researcher Profile'}
                  </h1>
                  <p className="text-2xl sm:text-3xl mb-6 text-white/90 font-light tracking-wide" data-testid="text-title">
                    {profile.title || 'Research Professional'}
                  </p>
                </div>
                
                {/* Enhanced Quick Stats Pills */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="stats-pill px-6 py-3 rounded-full">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 text-yellow-300" /> 
                      Verified Researcher
                    </span>
                  </div>
                  <div className="stats-pill px-6 py-3 rounded-full">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-300" />
                      Academic Professional
                    </span>
                  </div>
                  <div className="stats-pill px-6 py-3 rounded-full">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-300" />
                      Active Researcher
                    </span>
                  </div>
                </div>
              </div>
              
              {profile.bio && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-light" data-testid="text-bio">
                    {profile.bio}
                  </p>
                </div>
              )}
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                <a 
                  href={`https://openalex.org/people/${openalexId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button group bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/25 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-105 font-medium"
                  data-testid="link-openalex"
                >
                  <svg className="w-5 h-5 mr-3 inline group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  View on OpenAlex
                </a>
                {profile.cvUrl && (
                  <a 
                    href={profile.cvUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button group bg-white text-primary px-8 py-4 rounded-xl hover:bg-white/90 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                    data-testid="link-cv"
                  >
                    <svg className="w-5 h-5 mr-3 inline text-red-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Download CV
                  </a>
                )}
                <button className="action-button group bg-gradient-to-r from-accent/20 to-accent/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:from-accent/30 hover:to-accent/20 transition-all duration-300 border border-accent/20 hover:border-accent/40 font-medium">
                  <svg className="w-5 h-5 mr-3 inline group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Get In Touch
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Decorative Elements */}
        <div className="hero-decorative top-20 right-20 w-80 h-80 bg-gradient-to-r from-white/8 to-accent/5"></div>
        <div className="hero-decorative bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-accent/8 to-primary/5"></div>
        <div className="hero-decorative top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-primary/6 to-white/4"></div>
      </section>

      <StatsOverview openalexId={openalexId} />
      <PublicationAnalytics openalexId={openalexId} />
      <ResearchTopics openalexId={openalexId} />
      <Publications openalexId={openalexId} />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">
                {profile.displayName || researcher.display_name || 'Research Profile'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {profile.bio || 'Advancing research with real-world impact.'}
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
                Last updated: {profile.lastSyncedAt ? new Date(profile.lastSyncedAt).toLocaleDateString() : 'Never'}
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

    </div>
  );
}
