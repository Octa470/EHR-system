import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellIcon,
  CheckIcon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Notifications() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  useEffect(() => {
    if (user && !loading) {
      fetchNotifications();
    }
  }, [user, loading]);

  const fetchNotifications = async () => {
    setLoadingData(true);
    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError(error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.isRead
      );

      const markReadPromises = unreadNotifications.map((notification) =>
        fetch(`/api/notifications/${notification._id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(markReadPromises);

      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading your notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <AlertCircleIcon className="text-red-500 h-12 w-12 mb-4" />
        <h1 className="text-xl font-medium mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-4">
          You are not authenticated or your session has expired.
        </p>
        <Button onClick={() => navigate("/login")}>Return to Login</Button>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (dateString) => {
    const options = { weekday: "long", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const firstName = user.name.split(" ")[0];
  const currentDate = formatDate(new Date());

  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead
  );
  const readNotifications = notifications.filter(
    (notification) => notification.isRead
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar userRole={user.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar isAuthenticated={isAuthenticated} />
          <header className="flex h-16 items-center gap-2 px-4 border-b bg-white shadow">
            <SidebarTrigger />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">EHR</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {getGreeting()}, {firstName}!
                  </h1>
                  <p className="text-gray-600">{currentDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={fetchNotifications} variant="outline">
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    onClick={markAllAsRead}
                    disabled={unreadNotifications.length === 0}
                  >
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Mark All as Read
                  </Button>
                </div>
              </div>

              <Tabs
                defaultValue="all"
                className="mb-6"
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="all">
                    <BellIcon className="mr-2 h-4 w-4" />
                    All
                    <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {notifications.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    <AlertCircleIcon className="mr-2 h-4 w-4" />
                    Unread
                    <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {unreadNotifications.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Read
                    <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {readNotifications.length}
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BellIcon className="mr-2 h-5 w-5" />
                        All Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingData ? (
                        <div className="flex justify-center py-8">
                          <Progress value={66} className="bg-gray-200 w-48" />
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="space-y-4">
                          {notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-center justify-between p-4 rounded-lg ${
                                notification.isRead
                                  ? "bg-gray-50"
                                  : "bg-blue-50 border-l-4 border-blue-500"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                                    notification.isRead
                                      ? "bg-gray-200 text-gray-600"
                                      : "bg-blue-200 text-blue-700"
                                  }`}
                                >
                                  {notification.isRead ? (
                                    <CheckIcon className="h-6 w-6" />
                                  ) : (
                                    <BellIcon className="h-6 w-6" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {notification.message}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(notification.createdAt)} •{" "}
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  onClick={() => markAsRead(notification._id)}
                                  variant="outline"
                                >
                                  Mark as Read
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No notifications</p>
                          <Button onClick={() => navigate("/dashboard")}>
                            Return to Dashboard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="unread" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircleIcon className="mr-2 h-5 w-5" />
                        Unread Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingData ? (
                        <div className="flex justify-center py-8">
                          <Progress value={66} className="bg-gray-200 w-48" />
                        </div>
                      ) : unreadNotifications.length > 0 ? (
                        <div className="space-y-4">
                          {unreadNotifications.map((notification) => (
                            <div
                              key={notification._id}
                              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-lg font-bold text-blue-700">
                                  <BellIcon className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {notification.message}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(notification.createdAt)} •{" "}
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => markAsRead(notification._id)}
                                variant="outline"
                              >
                                Mark as Read
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            No unread notifications
                          </p>
                          <Button onClick={() => navigate("/dashboard")}>
                            Return to Dashboard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="read" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckIcon className="mr-2 h-5 w-5" />
                        Read Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingData ? (
                        <div className="flex justify-center py-8">
                          <Progress value={66} className="bg-gray-200 w-48" />
                        </div>
                      ) : readNotifications.length > 0 ? (
                        <div className="space-y-4">
                          {readNotifications.map((notification) => (
                            <div
                              key={notification._id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                                  <CheckIcon className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {notification.message}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(notification.createdAt)} •{" "}
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            No read notifications
                          </p>
                          <Button onClick={() => navigate("/dashboard")}>
                            Return to Dashboard
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Notifications;
