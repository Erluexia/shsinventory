import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, LogOut, User, Menu } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "./UserProfile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  const location = useLocation();
  const { toast } = useToast();
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const isCurrentRoute = (path: string) => location.pathname === path;
  const isCurrentRoom = (roomNumber: string) => location.pathname === `/rooms/${roomNumber}`;

  const SidebarContents = () => (
    <>
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
                className={cn(
                  "transition-colors duration-200 hover:bg-primary/10",
                  isCurrentRoute("/dashboard") && "bg-primary/20 text-primary font-medium"
                )}
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
      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupLabel>Floors</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {floors.map((floor) => (
              <SidebarMenuItem key={floor.id}>
                <SidebarMenuButton
                  asChild
                  onClick={() => setExpandedFloor(expandedFloor === floor.id ? null : floor.id)}
                  className={cn(
                    "transition-colors duration-200 hover:bg-primary/10",
                    expandedFloor === floor.id && "bg-primary/5 font-medium"
                  )}
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
                        onClick={() => {
                          navigate(`/rooms/${room}`);
                          setIsMobileOpen(false);
                        }}
                        className={cn(
                          "transition-colors duration-200 hover:bg-primary/10",
                          isCurrentRoom(room) && "bg-primary/20 text-primary font-medium"
                        )}
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

      {/* User Profile Section - Fixed at bottom */}
      <div className="mt-auto border-t p-4 bg-background">
        <div className="space-y-2">
          <SidebarMenuButton
            asChild
            onClick={() => navigate("/account")}
            className={cn(
              "transition-colors duration-200 hover:bg-primary/10",
              isCurrentRoute("/account") && "bg-primary/20 text-primary font-medium"
            )}
          >
            <button className="w-full flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            onClick={handleLogout}
            className="transition-colors duration-200 hover:bg-red-50 hover:text-red-600 group"
          >
            <button className="w-full flex items-center space-x-2">
              <LogOut className="w-4 h-4 group-hover:text-red-600" />
              <span>Logout</span>
            </button>
          </SidebarMenuButton>
        </div>
      </div>
    </>
  );

  // Mobile sidebar
  const mobileSidebar = (
    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SidebarContents />
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const desktopSidebar = (
    <Sidebar className="hidden md:flex">
      <SidebarContent>
        <SidebarContents />
      </SidebarContent>
    </Sidebar>
  );

  return (
    <>
      {mobileSidebar}
      {desktopSidebar}
    </>
  );
}