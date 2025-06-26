import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Users, AlertCircle, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserDetails {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  experienceLevel?: string;
  coursesCompleted: number;
  totalHours: number;
  lastActivity: string;
  progress: number;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);

  // In a real app, this would fetch actual user data
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // Mock user data since we don't have a real endpoint
      return [
        {
          id: "1",
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@hexaware.com",
          department: "Software Development",
          experienceLevel: "3-5 years",
          coursesCompleted: 8,
          totalHours: 47,
          lastActivity: "2 hours ago",
          progress: 65,
        },
        {
          id: "2", 
          firstName: "Alice",
          lastName: "Miller",
          email: "alice.miller@hexaware.com",
          department: "Data Science",
          experienceLevel: "6-10 years",
          coursesCompleted: 5,
          totalHours: 32,
          lastActivity: "1 day ago",
          progress: 42,
        },
        {
          id: "3",
          firstName: "Bob",
          lastName: "Johnson",
          email: "bob.johnson@hexaware.com",
          department: "UI/UX Design",
          experienceLevel: "0-2 years",
          coursesCompleted: 12,
          totalHours: 68,
          lastActivity: "3 hours ago",
          progress: 78,
        },
        {
          id: "4",
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@hexaware.com",
          department: "Quality Assurance",
          experienceLevel: "3-5 years",
          coursesCompleted: 6,
          totalHours: 28,
          lastActivity: "5 hours ago",
          progress: 55,
        },
      ] as UserDetails[];
    },
  });

  const departments = [
    "Software Development",
    "Data Science", 
    "UI/UX Design",
    "Quality Assurance",
    "DevOps",
    "Product Management"
  ];

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === "all" || user.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  }) || [];

  const getUserInitials = (user: UserDetails) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = (user: UserDetails) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "Unknown User";
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      "Software Development": "bg-blue-100 text-blue-800",
      "Data Science": "bg-purple-100 text-purple-800",
      "UI/UX Design": "bg-pink-100 text-pink-800",
      "Quality Assurance": "bg-green-100 text-green-800",
      "DevOps": "bg-orange-100 text-orange-800",
      "Product Management": "bg-indigo-100 text-indigo-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 80) return { label: "Excellent", color: "text-green-600" };
    if (progress >= 60) return { label: "On Track", color: "text-blue-600" };
    if (progress >= 40) return { label: "Needs Support", color: "text-orange-600" };
    return { label: "At Risk", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
          <p className="text-slate-600">Monitor and manage user progress and activities</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-2xl font-bold text-slate-800">{users?.length || 0}</p>
            <p className="text-sm text-slate-600">Total Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">80%+</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {users?.filter(u => u.progress >= 80).length || 0}
            </p>
            <p className="text-sm text-slate-600">High Performers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">60%</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {users?.filter(u => u.progress >= 60 && u.progress < 80).length || 0}
            </p>
            <p className="text-sm text-slate-600">On Track</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {users?.filter(u => u.progress < 40).length || 0}
            </p>
            <p className="text-sm text-slate-600">Need Support</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Users Found</h3>
              <p className="text-slate-600">
                {searchTerm || departmentFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No users are registered yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">User</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">Department</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">Experience</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">Progress</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">Last Activity</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => {
                    const progressStatus = getProgressStatus(user.progress);
                    
                    return (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-800">
                                {getUserDisplayName(user)}
                              </p>
                              <p className="text-sm text-slate-600">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <Badge className={getDepartmentColor(user.department || "")}>
                            {user.department}
                          </Badge>
                        </td>
                        
                        <td className="py-4 px-4">
                          <span className="text-sm text-slate-600">{user.experienceLevel}</span>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Progress value={user.progress} className="w-16 h-2" />
                            <span className="text-sm text-slate-600 w-10">{user.progress}%</span>
                          </div>
                          <p className={`text-xs font-medium ${progressStatus.color}`}>
                            {progressStatus.label}
                          </p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <p className="text-sm text-slate-600">{user.lastActivity}</p>
                        </td>
                        
                        <td className="py-4 px-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>User Details</DialogTitle>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                        {getUserInitials(selectedUser)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-lg font-semibold text-slate-800">
                                        {getUserDisplayName(selectedUser)}
                                      </h3>
                                      <p className="text-slate-600">{selectedUser.email}</p>
                                      <Badge className={getDepartmentColor(selectedUser.department || "")}>
                                        {selectedUser.department}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Experience Level</p>
                                      <p className="text-slate-600">{selectedUser.experienceLevel}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Overall Progress</p>
                                      <div className="flex items-center gap-2">
                                        <Progress value={selectedUser.progress} className="flex-1" />
                                        <span className="text-sm text-slate-600">{selectedUser.progress}%</span>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Courses Completed</p>
                                      <p className="text-slate-600">{selectedUser.coursesCompleted}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Total Learning Hours</p>
                                      <p className="text-slate-600">{selectedUser.totalHours} hours</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Last Activity</p>
                                      <p className="text-slate-600">{selectedUser.lastActivity}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">Status</p>
                                      <p className={`font-medium ${progressStatus.color}`}>
                                        {progressStatus.label}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
