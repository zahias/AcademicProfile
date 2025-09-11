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
} from "recharts";

interface PublicationAnalyticsProps {
  openalexId: string;
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

// Color palette for charts (theme-aware)
const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#00bcd4",
];

export default function PublicationAnalytics({ openalexId }: PublicationAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("cumulative");

  const { data: researcherData, isLoading } = useQuery<ResearcherData | null>({
    queryKey: [`/api/researcher/${openalexId}/data`],
    retry: false,
  });

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

    // Create cumulative data
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
        citations,
      });

      if (count > 0) {
        yearlyData.push({
          year,
          publications: count,
          citations,
          avgCitations: citations / count,
        });
      }
    }

    // Process topics data
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
      .slice(0, 10)
      .map(([topic, count]) => ({
        topic: topic.length > 30 ? topic.substring(0, 30) + "..." : topic,
        fullTopic: topic,
        count,
        percentage: ((count / publications.length) * 100).toFixed(1),
      }));

    // Process journals data
    const journalCounts: { [journal: string]: number } = {};
    publications.forEach(pub => {
      if (pub.journal) {
        const journal = pub.journal.trim();
        journalCounts[journal] = (journalCounts[journal] || 0) + 1;
      }
    });

    const journalsData = Object.entries(journalCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([journal, count]) => ({
        journal: journal.length > 25 ? journal.substring(0, 25) + "..." : journal,
        fullJournal: journal,
        count,
        percentage: ((count / publications.length) * 100).toFixed(1),
      }));

    // Process publication types (simplified categorization)
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

    // Citation data by year for impact chart
    const citationData = yearlyData.filter(d => d.citations > 0);

    return {
      cumulativeData,
      yearlyData,
      topicsData,
      journalsData,
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
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
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
          <p className="font-medium">{data.type || data.topic || data.journal}</p>
          <p>Count: {data.count}</p>
          <p>Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-16" data-testid="section-analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with summary stats */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Publication Analytics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Comprehensive insights into research output and impact patterns over time.
          </p>
          <div className="flex justify-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{chartData.totalPublications}</div>
              <div className="text-sm text-muted-foreground">Total Publications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{chartData.totalCitations}</div>
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

        {/* Chart Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5" data-testid="tabs-analytics">
            <TabsTrigger value="cumulative" data-testid="tab-cumulative">Growth</TabsTrigger>
            <TabsTrigger value="types" data-testid="tab-types">Types</TabsTrigger>
            <TabsTrigger value="citations" data-testid="tab-citations">Impact</TabsTrigger>
            <TabsTrigger value="topics" data-testid="tab-topics">Topics</TabsTrigger>
            <TabsTrigger value="journals" data-testid="tab-journals">Journals</TabsTrigger>
          </TabsList>

          {/* Cumulative Publications Chart */}
          <TabsContent value="cumulative" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card data-testid="card-cumulative-chart">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    📈 Cumulative Publications
                    <Badge variant="secondary" className="ml-2">
                      {chartData.yearRange.start} - {chartData.yearRange.end}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.cumulativeData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card data-testid="card-yearly-chart">
                <CardHeader>
                  <CardTitle>📊 Publications by Year</CardTitle>
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

          {/* Publication Types Chart */}
          <TabsContent value="types">
            <Card data-testid="card-types-chart">
              <CardHeader>
                <CardTitle>📋 Publication Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={chartData.typesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {chartData.typesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {chartData.typesData.map((item, index) => (
                      <div key={item.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.count}</div>
                          <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Citation Impact Chart */}
          <TabsContent value="citations">
            <Card data-testid="card-citations-chart">
              <CardHeader>
                <CardTitle>🏆 Citation Impact Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData.citationData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="citations" orientation="left" />
                    <YAxis yAxisId="avg" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="citations" dataKey="citations" fill="hsl(var(--primary))" opacity={0.7} />
                    <Line
                      yAxisId="avg"
                      type="monotone"
                      dataKey="avgCitations"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Research Topics Chart */}
          <TabsContent value="topics">
            <Card data-testid="card-topics-chart">
              <CardHeader>
                <CardTitle>🔬 Top Research Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={chartData.topicsData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="topic" width={120} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
                              <p className="font-medium">{data.fullTopic}</p>
                              <p>Publications: {data.count}</p>
                              <p>Percentage: {data.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journal Distribution Chart */}
          <TabsContent value="journals">
            <Card data-testid="card-journals-chart">
              <CardHeader>
                <CardTitle>📚 Top Publication Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart
                    data={chartData.journalsData}
                    layout="horizontal"
                    margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="journal" width={150} />
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-sm">
                              <p className="font-medium">{data.fullJournal}</p>
                              <p>Publications: {data.count}</p>
                              <p>Percentage: {data.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Insights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {Math.max(...chartData.yearlyData.map(d => d.publications), 0)}
              </div>
              <div className="text-muted-foreground text-sm">Most Productive Year</div>
              <div className="text-xs text-muted-foreground mt-1">
                {chartData.yearlyData.find(d => d.publications === Math.max(...chartData.yearlyData.map(d => d.publications)))?.year}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {Math.max(...chartData.citationData.map(d => d.citations), 0)}
              </div>
              <div className="text-muted-foreground text-sm">Highest Citation Year</div>
              <div className="text-xs text-muted-foreground mt-1">
                {chartData.citationData.find(d => d.citations === Math.max(...chartData.citationData.map(d => d.citations)))?.year}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {chartData.topicsData.length}
              </div>
              <div className="text-muted-foreground text-sm">Research Areas</div>
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