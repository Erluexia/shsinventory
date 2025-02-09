
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
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AddFloorDialog } from "./AddFloorDialog";
import { AddRoomDialog } from "./AddRoomDialog";

export interface Floor {
  id: string;
  name: string;
  floor_number: number;
  rooms: {
    id: string;
    room_number: string;
  }[];
}

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: floors, isLoading: isLoadingFloors } = useQuery({
    queryKey: ["floors"],
    queryFn: async () => {
      console.log("Fetching floors and rooms data");
      const { data: floorsData, error: floorsError } = await supabase
        .from("floors")
        .select(`
          id,
          name,
          floor_number,
          rooms (
            id,
            room_number
          )
        `)
        .order("floor_number");

      if (floorsError) {
        console.error("Error fetching floors:", floorsError);
        throw floorsError;
      }

      return floorsData as Floor[];
    },
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

      {/* Floors Management Group */}
      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <AddFloorDialog />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <AddRoomDialog floors={floors || []} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Floors Group */}
      <SidebarGroup className="flex-1 overflow-y-auto">
        <SidebarGroupLabel>Floors</SidebarGroupLabel>
        <SidebarGroupContent>
          {isLoadingFloors ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <SidebarMenu>
              {floors?.map((floor) => (
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
                          key={room.id}
                          asChild
                          onClick={() => {
                            navigate(`/rooms/${room.room_number}`);
                            setIsMobileOpen(false);
                          }}
                          className={cn(
                            "transition-colors duration-200 hover:bg-primary/10",
                            isCurrentRoom(room.room_number) && "bg-primary/20 text-primary font-medium"
                          )}
                        >
                          <button className="w-full text-sm py-1">
                            Room {room.room_number}
                          </button>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      {/* User Profile Section */}
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
