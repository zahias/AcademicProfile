import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  // Fetch public researcher data for Zahi Abdul Sater as demo
  const { data: researcherData, isLoading } = useQuery<{
    profile: any;
    researcher: any;
    topics: any[];
    publications: any[];
    affiliations: any[];
    lastSynced: string;
  } | null>({
    queryKey: ["/api/researcher/A5056485484/data"],
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
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Showcase Your Research Impact
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create beautiful, automatically-updated research profiles powered by OpenAlex API. 
            Showcase your publications, impact metrics, and academic journey in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-view-demo"
            >
              View Demo
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
                  <h3 className="font-semibold mb-2">Easy Management</h3>
                  <p className="text-muted-foreground text-sm">
                    Simple admin dashboard to manage your profile information and upload your CV
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      {!isLoading && researcherData && (
        <section id="demo" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Live Demo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See how your research profile could look with real data from OpenAlex
              </p>
            </div>
            
            <Card className="max-w-4xl mx-auto">
              <CardContent className="pt-6">
                <div className="text-center mb-8">
                  <img 
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                    alt="Researcher portrait" 
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-border"
                  />
                  <h3 className="text-2xl font-bold mb-2" data-testid="text-demo-name">
                    {researcherData?.researcher?.display_name || 'Dr. Zahi Abdul Sater'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {researcherData?.profile?.title || 'Senior Researcher in Health Sciences & Cancer Biology'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {researcherData?.affiliations?.[0]?.institutionName || 'American University of Beirut'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="text-demo-works">
                      {researcherData?.researcher?.works_count || 54}
                    </div>
                    <div className="text-sm text-muted-foreground">Publications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent" data-testid="text-demo-citations">
                      {researcherData?.researcher?.cited_by_count || 558}
                    </div>
                    <div className="text-sm text-muted-foreground">Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary" data-testid="text-demo-h-index">
                      {researcherData?.researcher?.summary_stats?.h_index || 14}
                    </div>
                    <div className="text-sm text-muted-foreground">h-index</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent" data-testid="text-demo-i10-index">
                      {researcherData?.researcher?.summary_stats?.i10_index || 17}
                    </div>
                    <div className="text-sm text-muted-foreground">i10-index</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={() => window.location.href = '/api/login'}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid="button-create-profile"
                  >
                    Create Your Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

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
