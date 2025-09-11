import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Download, 
  Clock, 
  Eye, 
  RefreshCw,
  ExternalLink,
  FileJson,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  slug: string;
  filename: string;
  lastModified: string;
}

interface TemplateData {
  slug: string;
  data: {
    name: string;
    title?: string;
    bio?: string;
    currentAffiliation?: string;
    openalexId: string;
    links?: {
      website?: string;
      google_scholar?: string;
      orcid?: string;
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      layout?: string;
    };
    isPublic?: boolean;
  };
  lastModified: string;
}

interface PreviewData {
  profile: {
    displayName: string;
    title?: string;
    bio?: string;
    currentAffiliation?: string;
    openalexId: string;
    links?: any;
    theme?: any;
  };
  researcher: {
    works_count?: number;
    cited_by_count?: number;
    summary_stats?: {
      h_index?: number;
      i10_index?: number;
    };
  } | null;
  topics: Array<{
    displayName: string;
    count: number;
    subfield: string;
    field: string;
    domain: string;
  }>;
  publications: Array<{
    title: string;
    authorNames?: string;
    journal?: string;
    publicationYear?: number;
    citationCount?: number;
    doi?: string;
    isOpenAccess?: boolean;
  }>;
  affiliations: Array<{
    institutionName: string;
    institutionType?: string;
    countryCode?: string;
    startYear?: number;
    endYear?: number;
  }>;
}

export default function TemplateGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Fetch templates list with periodic refresh
  const { data: templatesResponse, isLoading: templatesLoading, refetch: refetchTemplates } = useQuery<{templates: Template[], count: number}>({
    queryKey: ["/api/templates"],
    refetchInterval: 5000, // Refresh every 5 seconds to detect file changes
    retry: 3,
  });

  // Fetch selected template data
  const { data: templateData, isLoading: templateDataLoading } = useQuery<TemplateData>({
    queryKey: ["/api/templates", selectedTemplate],
    enabled: !!selectedTemplate,
    retry: 2,
  });

  // Fetch preview data for selected template
  const { data: previewData, isLoading: previewLoading } = useQuery<PreviewData>({
    queryKey: ["/api/preview", selectedTemplate],
    enabled: !!selectedTemplate,
    retry: 2,
    staleTime: 30000, // Data stays fresh for 30 seconds
  });

  const templates = templatesResponse?.templates || [];

  const handleTemplateSelect = (slug: string) => {
    setSelectedTemplate(slug);
  };

  const handleRefresh = () => {
    refetchTemplates();
    toast({
      title: "Templates refreshed",
      description: "Template list updated from file system",
    });
  };

  const handleExport = async () => {
    if (!selectedTemplate) return;

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${selectedTemplate}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate}-profile.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `${selectedTemplate}-profile.html has been downloaded`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Unable to export the template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewLive = () => {
    if (!selectedTemplate) return;
    window.open(`/api/preview/${selectedTemplate}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <FileJson className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Template Generator</h1>
                <p className="text-sm text-muted-foreground">Manage and preview researcher profile templates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={templatesLoading}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${templatesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {selectedTemplate && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewLive}
                    data-testid="button-view-live"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </Button>
                  
                  <Button
                    onClick={handleExport}
                    disabled={isExporting || !selectedTemplate}
                    data-testid="button-export"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export HTML
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Management Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Templates ({templates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full pr-4">
                  {templatesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-lg border">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2 mb-2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No Templates Found</h3>
                      <p className="text-sm text-muted-foreground">
                        Add JSON files to the <code>/data</code> directory to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <div
                          key={template.slug}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                            selectedTemplate === template.slug 
                              ? 'bg-primary/10 border-primary ring-2 ring-primary/20' 
                              : 'hover:border-muted-foreground/50'
                          }`}
                          onClick={() => handleTemplateSelect(template.slug)}
                          data-testid={`template-item-${template.slug}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm truncate pr-2" data-testid={`text-template-slug-${template.slug}`}>
                              {template.slug}
                            </h4>
                            {selectedTemplate === template.slug && (
                              <Badge variant="default" className="text-xs shrink-0">
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-2" data-testid={`text-template-filename-${template.slug}`}>
                            {template.filename}
                          </p>
                          
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span data-testid={`text-template-modified-${template.slug}`}>
                              {new Date(template.lastModified).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {!selectedTemplate ? (
              <Card className="h-[650px] flex items-center justify-center">
                <CardContent>
                  <div className="text-center">
                    <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-4">Select a Template</h3>
                    <p className="text-muted-foreground max-w-md">
                      Choose a JSON template from the left panel to preview the generated researcher profile.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Live Preview: {selectedTemplate}
                    </div>
                    {templateData && (
                      <Badge variant="secondary" className="text-xs">
                        Modified: {new Date(templateData.lastModified).toLocaleDateString()}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[550px] w-full">
                    {templateDataLoading || previewLoading ? (
                      <div className="space-y-6">
                        {/* Header Skeleton */}
                        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-8">
                          <div className="flex items-center space-x-6">
                            <Skeleton className="w-20 h-20 rounded-full" />
                            <div className="space-y-3">
                              <Skeleton className="h-8 w-64" />
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-4 w-56" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Stats Skeleton */}
                        <div className="grid grid-cols-4 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-muted rounded-lg p-4 text-center">
                              <Skeleton className="h-6 w-12 mx-auto mb-2" />
                              <Skeleton className="h-3 w-16 mx-auto" />
                            </div>
                          ))}
                        </div>
                        
                        {/* Content Skeleton */}
                        <div className="space-y-4">
                          <Skeleton className="h-6 w-48" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                          </div>
                        </div>
                      </div>
                    ) : previewData ? (
                      <div className="space-y-8">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg p-8">
                          <div className="flex items-start space-x-6">
                            <div className="w-20 h-20 bg-primary/30 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                              {previewData.profile.displayName?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <h1 className="text-3xl font-bold mb-2" data-testid="preview-researcher-name">
                                {previewData.profile.displayName}
                              </h1>
                              {previewData.profile.title && (
                                <p className="text-lg text-muted-foreground mb-2" data-testid="preview-researcher-title">
                                  {previewData.profile.title}
                                </p>
                              )}
                              {previewData.profile.currentAffiliation && (
                                <p className="text-muted-foreground mb-4" data-testid="preview-researcher-affiliation">
                                  {previewData.profile.currentAffiliation}
                                </p>
                              )}
                              {previewData.profile.bio && (
                                <p className="text-sm leading-relaxed" data-testid="preview-researcher-bio">
                                  {previewData.profile.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats Overview */}
                        {previewData.researcher && (
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-muted rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-primary" data-testid="preview-works-count">
                                {previewData.researcher.works_count || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Publications</div>
                            </div>
                            <div className="bg-muted rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-accent" data-testid="preview-citations-count">
                                {previewData.researcher.cited_by_count || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Citations</div>
                            </div>
                            <div className="bg-muted rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-primary" data-testid="preview-h-index">
                                {previewData.researcher.summary_stats?.h_index || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">h-index</div>
                            </div>
                            <div className="bg-muted rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-accent" data-testid="preview-i10-index">
                                {previewData.researcher.summary_stats?.i10_index || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">i10-index</div>
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Research Topics */}
                        {previewData.topics && previewData.topics.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Research Areas</h3>
                            <div className="flex flex-wrap gap-2">
                              {previewData.topics.slice(0, 12).map((topic, index) => (
                                <Badge key={index} variant="secondary" className="text-xs" data-testid={`preview-topic-${index}`}>
                                  {topic.displayName} ({topic.count})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recent Publications */}
                        {previewData.publications && previewData.publications.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Recent Publications</h3>
                            <div className="space-y-4">
                              {previewData.publications.slice(0, 5).map((pub, index) => (
                                <div key={index} className="bg-muted/50 rounded-lg p-4" data-testid={`preview-publication-${index}`}>
                                  <h4 className="font-medium text-sm mb-2 leading-tight">
                                    {pub.title}
                                  </h4>
                                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    {pub.journal && <span>📖 {pub.journal}</span>}
                                    {pub.publicationYear && <span>📅 {pub.publicationYear}</span>}
                                    {pub.citationCount && <span>📊 {pub.citationCount} citations</span>}
                                    {pub.isOpenAccess && <span className="text-green-600">🔓 Open Access</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Affiliations */}
                        {previewData.affiliations && previewData.affiliations.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Affiliations</h3>
                            <div className="grid grid-cols-1 gap-3">
                              {previewData.affiliations.slice(0, 3).map((aff, index) => (
                                <div key={index} className="bg-muted/50 rounded-lg p-3" data-testid={`preview-affiliation-${index}`}>
                                  <h4 className="font-medium text-sm">{aff.institutionName}</h4>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground">
                                      {aff.institutionType || 'Institution'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {aff.startYear || '?'} - {aff.endYear || 'Present'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Preview Available</h3>
                        <p className="text-sm text-muted-foreground">
                          Unable to load preview data for this template.
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}