import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CareerTimelineProps {
  openalexId: string;
}

export default function CareerTimeline({ openalexId }: CareerTimelineProps) {
  const { data: researcherData, isLoading } = useQuery({
    queryKey: [`/api/researcher/${openalexId}/data`],
    retry: false,
  });

  if (isLoading) {
    return (
      <section id="timeline" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="mb-8">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const affiliations = researcherData?.affiliations || [];

  return (
    <section id="timeline" className="py-16 bg-muted" data-testid="section-timeline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Career Timeline</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Academic journey across leading institutions.
          </p>
        </div>
        
        {affiliations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No career timeline available. Please sync your data in the admin panel.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
              
              {affiliations.map((affiliation, index) => {
                const yearsRange = affiliation.endYear && affiliation.endYear !== affiliation.startYear
                  ? `${affiliation.startYear}-${affiliation.endYear}`
                  : `${affiliation.startYear}-Present`;
                
                return (
                  <div key={affiliation.id} className="relative flex items-center mb-8 timeline-item" data-testid={`timeline-item-${index}`}>
                    <div className="absolute left-2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>
                    <div className="flex-1 ml-16">
                      <Card className="shadow-lg border border-border">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h3 className="font-semibold text-lg text-card-foreground" data-testid={`text-institution-name-${index}`}>
                              {affiliation.institutionName}
                            </h3>
                            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full mt-2 sm:mt-0" data-testid={`text-years-range-${index}`}>
                              {yearsRange}
                            </span>
                          </div>
                          {affiliation.institutionType && (
                            <p className="text-muted-foreground mb-2" data-testid={`text-institution-type-${index}`}>
                              {affiliation.institutionType}
                            </p>
                          )}
                          {affiliation.countryCode && (
                            <p className="text-sm text-muted-foreground" data-testid={`text-country-${index}`}>
                              <i className="fas fa-map-marker-alt mr-2 text-accent"></i>
                              {affiliation.countryCode}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
