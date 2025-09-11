import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicationsProps {
  openalexId: string;
}

export default function Publications({ openalexId }: PublicationsProps) {
  const { data: researcherData, isLoading } = useQuery({
    queryKey: [`/api/researcher/${openalexId}/data`],
    retry: false,
  });

  if (isLoading) {
    return (
      <section id="publications" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-64 mb-3" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const publications = researcherData?.publications || [];

  return (
    <section id="publications" className="py-16" data-testid="section-publications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Recent Publications</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Latest research contributions with real-world impact.
          </p>
        </div>
        
        {publications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No publications available. Please sync your data in the admin panel.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {publications.slice(0, 10).map((publication, index) => (
              <Card key={publication.id} className="hover:shadow-xl transition-shadow" data-testid={`card-publication-${index}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-card-foreground hover:text-primary cursor-pointer" data-testid={`text-publication-title-${index}`}>
                        {publication.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3" data-testid={`text-publication-authors-${index}`}>
                        {publication.authorNames}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        {publication.journal && (
                          <span className="text-sm text-muted-foreground" data-testid={`text-publication-journal-${index}`}>
                            {publication.journal}
                          </span>
                        )}
                        {publication.publicationYear && (
                          <span className="text-sm text-muted-foreground" data-testid={`text-publication-year-${index}`}>
                            {publication.publicationYear}
                          </span>
                        )}
                        <div className="flex items-center">
                          <i className="fas fa-quote-right text-accent mr-1"></i>
                          <span className="text-sm font-medium text-accent" data-testid={`text-publication-citations-${index}`}>
                            {publication.citationCount} citations
                          </span>
                        </div>
                      </div>
                      {publication.topics && publication.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(publication.topics as string[]).slice(0, 3).map((topic, topicIndex) => (
                            <span key={topicIndex} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded" data-testid={`tag-topic-${index}-${topicIndex}`}>
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end space-y-2">
                      {publication.doi && (
                        <a 
                          href={`https://doi.org/${publication.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                          data-testid={`link-publication-doi-${index}`}
                        >
                          <i className="fas fa-external-link-alt mr-1"></i>View Publication
                        </a>
                      )}
                      {publication.isOpenAccess && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded" data-testid={`badge-open-access-${index}`}>
                          Open Access
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {publications.length > 10 && (
          <div className="text-center mt-12">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 mr-4" data-testid="button-view-all-publications">
              View All Publications
            </Button>
            <Button variant="outline" data-testid="button-export-bibliography">
              Export Bibliography
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
