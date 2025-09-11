import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ResearchTopicsProps {
  openalexId: string;
}

export default function ResearchTopics({ openalexId }: ResearchTopicsProps) {
  const { data: researcherData, isLoading } = useQuery({
    queryKey: [`/api/researcher/${openalexId}/data`],
    retry: false,
  });

  if (isLoading) {
    return (
      <section id="research" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const topics = researcherData?.topics || [];

  return (
    <section id="research" className="py-16 bg-muted" data-testid="section-research-topics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Research Areas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Exploring diverse areas with significant impact across multiple domains.
          </p>
        </div>
        
        {topics.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No research topics available. Please sync your data in the admin panel.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.slice(0, 9).map((topic, index) => {
              const maxCount = Math.max(...topics.map(t => t.count));
              const widthPercentage = (topic.count / maxCount) * 100;
              
              return (
                <Card key={topic.id} className="research-card hover:shadow-xl transition-all duration-200" data-testid={`card-topic-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-card-foreground" data-testid={`text-topic-name-${index}`}>
                        {topic.displayName}
                      </h3>
                      <span className="bg-primary text-primary-foreground text-sm px-2 py-1 rounded-full" data-testid={`text-topic-count-${index}`}>
                        {topic.count}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3" data-testid={`text-topic-subfield-${index}`}>
                      {topic.subfield}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded" data-testid={`text-topic-field-${index}`}>
                        {topic.field}
                      </span>
                      <div className="flex items-center text-accent">
                        <div className="w-16 bg-muted h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-accent h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${widthPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {topics.length > 9 && (
          <div className="text-center mt-12">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-view-all-topics">
              View All Research Areas
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
