import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { TrendingUp, BarChart3, Award } from "lucide-react";

interface PublicationAnalyticsProps {
  openalexId: string;
  researcherData?: ResearcherData | null;
}

interface Publication {
  id: string;
  title: string;
  authorNames?: string;
  journal?: string;
  publicationYear?: number;
  citationCount?: number;
  topics?: string[];
  doi?: string;
  isOpenAccess?: boolean;
}

interface ResearcherData {
  profile: any;
  researcher: any;
  topics: any[];
  publications: Publication[];
  affiliations: any[];
  lastSynced: string;
}

// Enhanced color palette - vibrant, non-black colors
const CHART_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
];

export default function PublicationAnalytics({ openalexId, researcherData: propResearcherData }: PublicationAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("growth");

  const { data: fetchedData, isLoading } = useQuery<ResearcherData | null>({
    queryKey: [`/api/researcher/${openalexId}/data`],
    retry: false,
    enabled: !propResearcherData,
  });

  const researcherData = propResearcherData || fetchedData;

  // Data processing and chart calculations
  const chartData = useMemo(() => {
    if (!researcherData?.publications || researcherData.publications.length === 0) {
      return {
        cumulativeData: [],
        yearlyData: [],
        topicsData: [],
        typesData: [],
        citationData: [],
        totalPublications: 0,
        totalCitations: 0,
        avgCitations: 0,
        yearRange: { start: 0, end: 0 },
        mostProductiveYear: { year: 0, count: 0 },
        highestCitationYear: { year: 0, count: 0 },
        researchAreasCount: 0,
      };
    }

    const publications = researcherData.publications;
    const currentYear = new Date().getFullYear();

    // Calculate cumulative publications by year
    const yearCounts: { [year: number]: number } = {};
    const yearCitations: { [year: number]: number } = {};
    let totalCitations = 0;

    publications.forEach(pub => {
      const year = pub.publicationYear || currentYear;
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      const citations = pub.citationCount || 0;
      yearCitations[year] = (yearCitations[year] || 0) + citations;
      totalCitations += citations;
    });

    const startYear = Math.min(...Object.keys(yearCounts).map(Number));
    const endYear = Math.max(...Object.keys(yearCounts).map(Number));

    // Create cumulative and yearly data
    const cumulativeData = [];
    const yearlyData = [];
    let cumulative = 0;

    for (let year = startYear; year <= endYear; year++) {
      const count = yearCounts[year] || 0;
      cumulative += count;
      const citations = yearCitations[year] || 0;

      cumulativeData.push({
        year,
        cumulative,
        publications: count,
      });

      if (count > 0) {
        yearlyData.push({
          year,
          publications: count,
          citations,
          avgCitations: (citations / count).toFixed(1),
        });
      }
    }

    // Find most productive year
    const mostProductiveYear = yearlyData.reduce((max, curr) => 
      curr.publications > max.count ? { year: curr.year, count: curr.publications } : max
    , { year: 0, count: 0 });

    // Find highest citation year
    const highestCitationYear = yearlyData.reduce((max, curr) => 
      curr.citations > max.count ? { year: curr.year, count: curr.citations } : max
    , { year: 0, count: 0 });

    // Count unique research topics
    const topicSet = new Set<string>();
    publications.forEach(pub => {
      if (pub.topics && Array.isArray(pub.topics)) {
        pub.topics.forEach(topic => {
          if (typeof topic === 'string') {
            topicSet.add(topic);
          }
        });
      }
    });

    // Process publication types
    const typeCounts = {
      "Journal Articles": 0,
      "Conference Papers": 0,
      "Books/Chapters": 0,
      "Other": 0,
    };

    publications.forEach(pub => {
      const journal = (pub.journal || "").toLowerCase();
      if (journal.includes("conference") || journal.includes("proceedings") || journal.includes("symposium")) {
        typeCounts["Conference Papers"]++;
      } else if (journal.includes("book") || journal.includes("chapter")) {
        typeCounts["Books/Chapters"]++;
      } else if (journal) {
        typeCounts["Journal Articles"]++;
      } else {
        typeCounts["Other"]++;
      }
    });

    const typesData = Object.entries(typeCounts)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / publications.length) * 100).toFixed(1),
      }));

    // Citation impact data
    const citationData = yearlyData.map(d => ({
      year: d.year,
      publications: d.publications,
      citations: d.citations,
    }));

    return {
      cumulativeData,
      yearlyData,
      topicsData: [],
      typesData,
      citationData,
      totalPublications: publications.length,
      totalCitations,
      avgCitations: totalCitations / publications.length,
      yearRange: { start: startYear, end: endYear },
      mostProductiveYear,
      highestCitationYear,
      researchAreasCount: topicSet.size,
    };
  }, [researcherData]);

  if (isLoading) {
    return (
      <section className="py-16" data-testid="section-analytics-loading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (chartData.totalPublications === 0) {
    return (
      <section className="py-16" data-testid="section-analytics-empty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Publication Analytics</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive insights into research output and impact.
            </p>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Publication Data Available</h3>
              <p className="text-muted-foreground">
                Analytics will appear here once publication data is synchronized from OpenAlex.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section id="analytics" className="py-16" data-testid="section-analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with summary stats */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Publication Analytics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive insights into research output and impact patterns over time.
          </p>
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {chartData.mostProductiveYear.count}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Most Productive Year</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {chartData.mostProductiveYear.year || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {chartData.highestCitationYear.count}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Highest Citation Year</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {chartData.highestCitationYear.year || 'N/A'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {chartData.researchAreasCount}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Research Areas</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Distinct topics
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {chartData.avgCitations.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Avg Citations/Paper</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Per publication
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {chartData.yearRange.end - chartData.yearRange.start + 1}
                </div>
                <div className="text-sm text-muted-foreground font-medium">Active Years</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {chartData.yearRange.start} - {chartData.yearRange.end}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3" data-testid="tabs-analytics">
            <TabsTrigger value="growth" data-testid="tab-growth">
              <TrendingUp className="w-4 h-4 mr-2" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="types" data-testid="tab-types">
              <BarChart3 className="w-4 h-4 mr-2" />
              Types
            </TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">
              <Award className="w-4 h-4 mr-2" />
              Impact
            </TabsTrigger>
          </TabsList>

          {/* Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card data-testid="card-cumulative-chart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Cumulative Publications
                    <Badge variant="secondary" className="ml-auto">
                      {chartData.yearRange.start} - {chartData.yearRange.end}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.cumulativeData}>
                      <defs>
                        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        name="Total Publications"
                        stroke="hsl(var(--primary))"
                        fill="url(#colorCumulative)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-yearly-chart">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    Publications by Year
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="publications" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types">
            <Card data-testid="card-types-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Publication Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bar Chart instead of Pie */}
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData.typesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="type" width={150} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {chartData.typesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  
                  {/* Legend with Colors */}
                  <div className="space-y-3 flex flex-col justify-center">
                    {chartData.typesData.map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-sm"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact">
            <Card data-testid="card-impact-chart">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-accent" />
                  Citation Impact Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData.citationData}>
                    <defs>
                      <linearGradient id="colorCitations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="publications" 
                      fill="hsl(var(--primary))" 
                      opacity={0.5}
                      radius={[4, 4, 0, 0]}
                      name="Publications"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="citations"
                      stroke="hsl(var(--accent))"
                      fill="url(#colorCitations)"
                      strokeWidth={2}
                      name="Citations"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
