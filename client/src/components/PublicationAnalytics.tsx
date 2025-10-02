import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
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

// Enhanced color palette for charts
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

export default function PublicationAnalytics({ openalexId, researcherData: propResearcherData }: PublicationAnalyticsProps) {
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
        journalsData: [],
        typesData: [],
        citationData: [],
        totalPublications: 0,
        totalCitations: 0,
        avgCitations: 0,
        yearRange: { start: 0, end: 0 },
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

    // Process topics data - get top research topics
    const topicCounts: { [topic: string]: number } = {};
    publications.forEach(pub => {
      if (pub.topics && Array.isArray(pub.topics)) {
        pub.topics.forEach(topic => {
          if (typeof topic === 'string') {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          }
        });
      }
    });

    const topicsData = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([topic, count]) => ({
        topic: topic.length > 25 ? topic.substring(0, 25) + "..." : topic,
        fullTopic: topic,
        count,
        percentage: ((count / publications.length) * 100).toFixed(1),
      }));

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

    // Citation impact data - combine publications and citations
    const citationData = yearlyData.map(d => ({
      year: d.year,
      publications: d.publications,
      citations: d.citations,
    }));

    return {
      cumulativeData,
      yearlyData,
      topicsData,
      journalsData: [],
      typesData,
      citationData,
      totalPublications: publications.length,
      totalCitations,
      avgCitations: totalCitations / publications.length,
      yearRange: { start: startYear, end: endYear },
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

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.type || data.topic}</p>
          <p className="text-sm">Count: {data.count}</p>
          <p className="text-sm">Percentage: {data.percentage}%</p>
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
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Comprehensive insights into research output and impact patterns over time.
          </p>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{researcherData?.researcher?.works_count || chartData.totalPublications}</div>
              <div className="text-sm text-muted-foreground">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{researcherData?.researcher?.cited_by_count || chartData.totalCitations}</div>
              <div className="text-sm text-muted-foreground">Total Citations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{chartData.avgCitations.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Citations/Paper</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {chartData.yearRange.end - chartData.yearRange.start + 1}
              </div>
              <div className="text-sm text-muted-foreground">Active Years</div>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="space-y-8">
          {/* Growth Section - Full Width */}
          <Card data-testid="card-growth-section" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Publication Growth Over Time
                <Badge variant="secondary" className="ml-auto">
                  {chartData.yearRange.start} - {chartData.yearRange.end}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
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
                    name="Cumulative Publications"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorCumulative)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Two Column Grid: Types and Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Types Section */}
            <Card data-testid="card-types-section" className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Publication Types
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={chartData.typesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="count"
                        label={({ percentage }) => `${percentage}%`}
                      >
                        {chartData.typesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-2 mt-4">
                    {chartData.typesData.map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{item.type}</span>
                        </div>
                        <div className="text-sm font-bold">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Section */}
            <Card data-testid="card-impact-section" className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  Citation Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={chartData.citationData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="publications" 
                      fill="hsl(var(--primary))" 
                      opacity={0.6}
                      radius={[4, 4, 0, 0]}
                      name="Publications"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="citations"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(var(--accent))" }}
                      name="Citations"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Topics Section - Full Width */}
          <Card data-testid="card-topics-section" className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                Top Research Topics
                <Badge variant="secondary" className="ml-2">
                  Top {chartData.topicsData.length} Areas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData.topicsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="topic" width={140} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                            <p className="font-medium mb-1">{data.fullTopic}</p>
                            <p className="text-sm">Publications: {data.count}</p>
                            <p className="text-sm">Coverage: {data.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.topicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Additional Insights Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.max(...chartData.yearlyData.map(d => d.publications), 0)}
              </div>
              <div className="text-muted-foreground text-sm font-medium">Most Productive Year</div>
              <div className="text-xs text-muted-foreground mt-1">
                {chartData.yearlyData.find(d => d.publications === Math.max(...chartData.yearlyData.map(d => d.publications)))?.year || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {Math.max(...chartData.citationData.map(d => d.citations), 0)}
              </div>
              <div className="text-muted-foreground text-sm font-medium">Highest Citation Year</div>
              <div className="text-xs text-muted-foreground mt-1">
                {chartData.citationData.find(d => d.citations === Math.max(...chartData.citationData.map(d => d.citations)))?.year || 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {chartData.topicsData.length}
              </div>
              <div className="text-muted-foreground text-sm font-medium">Research Areas</div>
              <div className="text-xs text-muted-foreground mt-1">
                Distinct topic areas
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
