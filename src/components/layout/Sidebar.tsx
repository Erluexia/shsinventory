import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./UserProfile";

// Updated floors data to remove specific room numbers
const floors = [
  {
    name: "First Floor",
    id: "1",
    rooms: Array.from({ length: 8 }, (_, i) => `10${i + 2}`),
  },
  {
    name: "Second Floor",
    id: "2",
    rooms: Array.from({ length: 8 }, (_, i) => `20${i + 2}`),
  },
  {
    name: "Third Floor",
    id: "3",
    rooms: Array.from({ length: 8 }, (_, i) => `30${i + 2}`),
  },
  {
    name: "Fourth Floor",
    id: "4",
    rooms: Array.from({ length: 8 }, (_, i) => `40${i + 2}`),
  },
  {
    name: "Fifth Floor",
    id: "5",
    rooms: Array.from({ length: 8 }, (_, i) => `50${i + 2}`),
  },
  {
    name: "Sixth Floor",
    id: "6",
    rooms: Array.from({ length: 8 }, (_, i) => `60${i + 2}`),
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);

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

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary">MCPI Inventory</h1>
        </div>
        
        {/* Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={() => navigate("/dashboard")}
                >
                  <button className="w-full">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Floors Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Floors</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {floors.map((floor) => (
                <SidebarMenuItem key={floor.id}>
                  <SidebarMenuButton
                    asChild
                    onClick={() => setExpandedFloor(expandedFloor === floor.id ? null : floor.id)}
                  >
                    <button className="w-full">
                      <span>{floor.name}</span>
                    </button>
                  </SidebarMenuButton>
                  {expandedFloor === floor.id && (
                    <div className="ml-4 mt-2 space-y-1">
                      {floor.rooms.map((room) => (
                        <SidebarMenuButton
                          key={room}
                          asChild
                          onClick={() => navigate(`/rooms/${room}`)}
                        >
                          <button className="w-full text-sm py-1">
                            Room {room}
                          </button>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        <div className="mt-auto p-4">
          <div className="space-y-2">
            <SidebarMenuButton
              asChild
              onClick={() => navigate("/account")}
            >
              <button className="w-full flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
            </SidebarMenuButton>
            <SidebarMenuButton
              asChild
              onClick={handleLogout}
            >
              <button className="w-full flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}