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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  UserIcon,
  KeyIcon,
  MailIcon,
  ImageIcon,
  CheckCircleIcon,
  XCircleIcon,
  UploadIcon,
} from "lucide-react";
import Navbar from "@/components/pages/Navbar";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/pages/Footer";

function Settings() {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState("");

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
      setName(user.name || "");
      setEmail(user.email || "");
      setProfilePicture(user.profilePicture || "");
      setProfilePicturePreview(user.profilePicture || "");
    }
  }, [user, loading]);

  const handleChangeName = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/user/change-name", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ newName: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update name");
      }

      setSuccess("Name updated successfully");
      updateUser({ ...user, name }); // Update user context

      toast.success("Your name has been updated successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Current password is required to change email");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/change-email", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newEmail: email,
          password: currentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update email");
      }

      setSuccess("Email updated successfully");
      updateUser({ ...user, email }); // Update user context
      setCurrentPassword("");

      toast.success("Your email has been updated successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Your password has been updated successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPG, PNG)");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setProfilePictureFile(file);
    setError(null);

    // Create preview URL - same as Registration.jsx
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleChangeProfilePicture = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
  
    if (!profilePictureFile) {
      setError("Please select an image file");
      setSaving(false);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("profilePicture", profilePictureFile);
      formData.append("userId", user.id);
  
      const response = await fetch("/api/user/change-profile-picture", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
  
      // Check for non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile picture");
      }
  
      setSuccess("Profile picture updated successfully");
      setProfilePicture(data.url);
      updateUser({ ...user, profilePicture: data.url });
  
      toast.success("Your profile picture has been updated successfully");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      console.error("Profile picture update error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-4">
          <Progress value={55} className="bg-gray-200 w-48 h-2" />
          <p className="text-gray-600">Loading your settings...</p>
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
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto bg-gray-100">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account preferences and information
                </p>
              </div>

              <Tabs
                defaultValue="profile"
                className="mb-6"
                onValueChange={setActiveTab}
              >
                <TabsList>
                  <TabsTrigger value="profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="email">
                    <MailIcon className="mr-2 h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="password">
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="picture">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Profile Picture
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleChangeName} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>

                        {success && activeTab === "profile" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-green-50 text-green-700">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            {success}
                          </div>
                        )}

                        {error && activeTab === "profile" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-red-50 text-red-700">
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="email" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleChangeEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="current-password-email">
                            Current Password
                          </Label>
                          <Input
                            id="current-password-email"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                          />
                          <p className="text-sm text-gray-500">
                            Your current password is required to change your
                            email address
                          </p>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>

                        {success && activeTab === "email" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-green-50 text-green-700">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            {success}
                          </div>
                        )}

                        {error && activeTab === "email" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-red-50 text-red-700">
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="password" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleChangePassword}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter your current password"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            required
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Update Password"}
                          </Button>
                        </div>

                        {success && activeTab === "password" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-green-50 text-green-700">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            {success}
                          </div>
                        )}

                        {error && activeTab === "password" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-red-50 text-red-700">
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="picture" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleChangeProfilePicture}
                        className="space-y-6"
                      >
                        <div className="flex items-center space-x-6">
                          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                            {profilePicturePreview ? (
                              <img
                                src={profilePicturePreview}
                                alt="Profile"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-full w-full p-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Label
                              htmlFor="profile-picture"
                              className="block mb-2"
                            >
                              Upload new picture
                            </Label>
                            <div className="flex items-center">
                              <Input
                                id="profile-picture"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("profile-picture")
                                    .click()
                                }
                              >
                                <UploadIcon className="mr-2 h-4 w-4" />
                                Choose File
                              </Button>
                              <span className="ml-3 text-sm text-gray-500">
                                {profilePictureFile
                                  ? profilePictureFile.name
                                  : "No file chosen"}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              JPG, PNG. Max size 5MB.
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={saving || !profilePictureFile}
                          >
                            {saving ? "Uploading..." : "Update Profile Picture"}
                          </Button>
                        </div>

                        {success && activeTab === "picture" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-green-50 text-green-700">
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            {success}
                          </div>
                        )}

                        {error && activeTab === "picture" && (
                          <div className="flex items-center p-3 text-sm rounded-md bg-red-50 text-red-700">
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        )}
                      </form>
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

export default Settings;
