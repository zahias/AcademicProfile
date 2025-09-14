import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface ResearcherProfile {
  id: string;
  openalexId: string;
  displayName: string;
  title?: string;
  bio?: string;
  currentAffiliation?: string;
  currentPosition?: string;
  stats?: {
    worksCount: number;
    citedByCount: number;
    hIndex: number;
    i10Index: number;
  } | null;
}

export default function Landing() {
  // Fetch all public researcher profiles
  const { data: researchers, isLoading } = useQuery<ResearcherProfile[]>({
    queryKey: ["/api/researchers/public"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-semibold text-xl text-primary">Research Profile Platform</span>
            </div>
            <div className="flex items-center">
              </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Research Impact
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Explore beautiful, automatically-updated research profiles powered by OpenAlex API. 
            Discover publications, impact metrics, and academic journeys from researchers worldwide.
          </p>
          
          <div className="flex justify-center mb-12">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('researchers')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-browse-researchers"
            >
              Browse Researchers
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create an impressive research showcase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-sync-alt text-primary text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Auto-Sync Data</h3>
                  <p className="text-muted-foreground text-sm">
                    Automatically pull and update your publications, citations, and research metrics from OpenAlex
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-chart-line text-accent text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Impact Metrics</h3>
                  <p className="text-muted-foreground text-sm">
                    Showcase your h-index, citation counts, and research impact with beautiful visualizations
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-cog text-primary text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Open Access</h3>
                  <p className="text-muted-foreground text-sm">
                    Free and open access to comprehensive research profiles and academic data
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Researcher Directory Section */}
      <section id="researchers" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Researchers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover researcher profiles and their academic contributions
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2 w-full">
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-3 w-1/2 mx-auto" />
                        <Skeleton className="h-3 w-2/3 mx-auto" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-center">
                          <Skeleton className="h-6 w-8 mx-auto mb-1" />
                          <Skeleton className="h-3 w-16 mx-auto" />
                        </div>
                        <div className="text-center">
                          <Skeleton className="h-6 w-8 mx-auto mb-1" />
                          <Skeleton className="h-3 w-12 mx-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : researchers && researchers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researchers.map((researcher) => (
                <Link key={researcher.id} href={`/researcher/${researcher.openalexId}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-2xl font-bold text-primary">
                            {researcher.displayName?.charAt(0) || '?'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" data-testid={`text-researcher-name-${researcher.openalexId}`}>
                            {researcher.displayName}
                          </h3>
                          {researcher.title && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-researcher-title-${researcher.openalexId}`}>
                              {researcher.title}
                            </p>
                          )}
                          {researcher.currentAffiliation && (
                            <Badge variant="secondary" className="text-xs" data-testid={`text-researcher-affiliation-${researcher.openalexId}`}>
                              {researcher.currentAffiliation}
                            </Badge>
                          )}
                        </div>
                        
                        {researcher.stats && (
                          <div className="grid grid-cols-2 gap-4 w-full text-sm">
                            <div className="text-center">
                              <div className="text-xl font-bold text-primary" data-testid={`text-researcher-works-${researcher.openalexId}`}>
                                {researcher.stats.worksCount}
                              </div>
                              <div className="text-xs text-muted-foreground">Publications</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-accent" data-testid={`text-researcher-citations-${researcher.openalexId}`}>
                                {researcher.stats.citedByCount}
                              </div>
                              <div className="text-xs text-muted-foreground">Citations</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">No Researchers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first researcher to join our platform!
                </p>
                <p className="text-sm text-muted-foreground">
                  No researchers are currently showcased.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="text-center mt-12">
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Research Profile Platform. Powered by OpenAlex API.
          </p>
        </div>
      </footer>
    </div>
  );
}
