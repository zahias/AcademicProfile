import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAdminClick: () => void;
}

export default function Navigation({ onAdminClick }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-semibold text-xl text-primary">Research Profile</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
            <a href="#research" className="text-muted-foreground hover:text-foreground transition-colors">Research</a>
            <a href="#publications" className="text-muted-foreground hover:text-foreground transition-colors">Publications</a>
            <a href="#timeline" className="text-muted-foreground hover:text-foreground transition-colors">Timeline</a>
            <Button 
              onClick={onAdminClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-admin"
            >
              <i className="fas fa-user-cog mr-2"></i>Admin
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              Sign Out
            </Button>
          </div>
          <div className="md:hidden">
            <button className="text-muted-foreground hover:text-foreground">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
