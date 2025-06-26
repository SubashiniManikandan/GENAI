import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Calendar, Filter, BarChart3, Users, BookOpen, TrendingUp } from "lucide-react";
import ProgressChart from "@/components/Charts/ProgressChart";

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [technologyFilter, setTechnologyFilter] = useState("all");

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
  });

  // Mock report data
  const generateReportData = () => {
    const departments = ["Software Development", "Data Science", "UI/UX Design", "Quality Assurance"];
    
    return departments.map(dept => ({
      department: dept,
      totalUsers: Math.floor(Math.random() * 50) + 20,
      coursesCompleted: Math.floor(Math.random() * 200) + 100,
      avgProgress: Math.floor(Math.random() * 40) + 60,
      learningHours: Math.floor(Math.random() * 1000) + 500,
    }));
  };

  const generateIndividualReports = () => {
    const users = [
      { name: "John Smith", department: "Software Development", coursesCompleted: 8, avgScore: 85, hours: 47, status: "On Track" },
      { name: "Alice Miller", department: "Data Science", coursesCompleted: 5, avgScore: 78, hours: 32, status: "Needs Support" },
      { name: "Bob Johnson", department: "UI/UX Design", coursesCompleted: 12, avgScore: 92, hours: 68, status: "Excellent" },
      { name: "Sarah Wilson", department: "Quality Assurance", coursesCompleted: 6, avgScore: 88, hours: 28, status: "On Track" },
      { name: "Mike Davis", department: "Software Development", coursesCompleted: 9, avgScore: 76, hours: 55, status: "On Track" },
      { name: "Emma Brown", department: "Data Science", coursesCompleted: 4, avgScore: 82, hours: 23, status: "Needs Support" },
    ];

    return departmentFilter === "all" 
      ? users 
      : users.filter(user => user.department === departmentFilter);
  };

  const generateTechnologyProgress = () => {
    return technologies?.map(tech => ({
      name: tech.name,
      totalAttempts: Math.floor(Math.random() * 100) + 50,
      avgScore: Math.floor(Math.random() * 30) + 70,
      completionRate: Math.floor(Math.random() * 40) + 60,
    })) || [];
  };

  const getMonthlyTrends = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      months.push({
        month: date.toLocaleDateString('en', { month: 'short' }),
        enrollments: Math.floor(Math.random() * 50) + 100,
        completions: Math.floor(Math.random() * 30) + 40,
        avgScore: Math.floor(Math.random() * 20) + 75,
      });
    }
    
    return months;
  };

  const handleExportReport = () => {
    // In a real app, this would generate and download a PDF/Excel report
    const reportData = {
      dateRange,
      department: departmentFilter,
      technology: technologyFilter,
      summary: adminStats,
      departmentData: generateReportData(),
      individualData: generateIndividualReports(),
      technologyData: generateTechnologyProgress(),
      trends: getMonthlyTrends(),
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-green-100 text-green-800";
      case "On Track": return "bg-blue-100 text-blue-800";
      case "Needs Support": return "bg-orange-100 text-orange-800";
      case "At Risk": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const departmentData = generateReportData();
  const individualData = generateIndividualReports();
  const technologyData = generateTechnologyProgress();
  const monthlyTrends = getMonthlyTrends();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-600">Generate comprehensive learning analytics reports</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="180">Last 6 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Software Development">Software Development</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                  <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Technology</label>
              <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technologies</SelectItem>
                  {technologies?.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id.toString()}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">{adminStats?.totalUsers || 0}</p>
            <p className="text-sm text-slate-600">Total Active Users</p>
            <div className="mt-2 flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">{adminStats?.courseCompletions || 0}</p>
            <p className="text-sm text-slate-600">Course Completions</p>
            <div className="mt-2 flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+15%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">{adminStats?.totalLearningHours || 0}</p>
            <p className="text-sm text-slate-600">Learning Hours</p>
            <div className="mt-2 flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+23%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">87%</p>
            <p className="text-sm text-slate-600">Avg Completion Rate</p>
            <div className="mt-2 flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+5%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Learning Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={monthlyTrends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{dept.avgProgress}%</span>
                      <span className="text-sm text-slate-500">({dept.totalUsers} users)</span>
                    </div>
                  </div>
                  <Progress value={dept.avgProgress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technology Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Technology</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Attempts</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Avg Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Completion Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {technologyData.map((tech) => (
                  <tr key={tech.name} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{tech.name}</td>
                    <td className="py-3 px-4 text-slate-600">{tech.totalAttempts}</td>
                    <td className="py-3 px-4 text-slate-600">{tech.avgScore}%</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={tech.completionRate} className="w-20 h-2" />
                        <span className="text-sm text-slate-600">{tech.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={tech.avgScore >= 80 ? "default" : tech.avgScore >= 70 ? "secondary" : "outline"}>
                        {tech.avgScore >= 80 ? "Excellent" : tech.avgScore >= 70 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Individual Performance Report */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Courses Completed</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Avg Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {individualData.map((user, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{user.name}</td>
                    <td className="py-3 px-4 text-slate-600">{user.department}</td>
                    <td className="py-3 px-4 text-slate-600">{user.coursesCompleted}</td>
                    <td className="py-3 px-4 text-slate-600">{user.avgScore}%</td>
                    <td className="py-3 px-4 text-slate-600">{user.hours}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
