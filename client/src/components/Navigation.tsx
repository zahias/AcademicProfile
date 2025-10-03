import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-semibold text-xl text-primary">Research Profile</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#overview" className="text-muted-foreground hover:text-foreground transition-colors">Overview</a>
            <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
            <a href="#research" className="text-muted-foreground hover:text-foreground transition-colors">Research Areas</a>
            <a href="#publications" className="text-muted-foreground hover:text-foreground transition-colors">Publications</a>
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
