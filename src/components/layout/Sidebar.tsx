import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Inventory",
    icon: BookOpen,
    path: "/inventory",
  },
  {
    title: "Maintenance",
    icon: Wrench,
    path: "/maintenance",
  },
  {
    title: "Alerts",
    icon: AlertTriangle,
    path: "/alerts",
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: "",
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      navigate("/login");
    }
  };

  const handleProfileUpdate = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        username: profileData.username,
        avatar_url: profileData.avatar_url,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setIsProfileOpen(false);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarContent>
          <div className="p-4">
            <h1 className="text-xl font-bold text-primary">MCPI Inventory</h1>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      onClick={() => navigate(item.path)}
                    >
                      <button className="w-full">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto p-4">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src={profileData.avatar_url} />
                <AvatarFallback>
                  {profileData.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profileData.username || "User"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setIsProfileOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) =>
                  setProfileData({ ...profileData, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="avatar">Profile Picture</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // TODO: Implement image cropping
                    const { data, error } = await supabase.storage
                      .from("avatars")
                      .upload(`${Date.now()}-${file.name}`, file);

                    if (error) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to upload image. Please try again.",
                      });
                    } else if (data) {
                      const { data: urlData } = supabase.storage
                        .from("avatars")
                        .getPublicUrl(data.path);
                      setProfileData({
                        ...profileData,
                        avatar_url: urlData.publicUrl,
                      });
                    }
                  }
                }}
              />
            </div>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}