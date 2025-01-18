import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Account() {
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: "",
    email: "",
  });
  const { toast } = useToast();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async () => {
    if (!selectedImage) return;

    const image = new Image();
    image.src = selectedImage;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    ctx.drawImage(
      image,
      crop.x * image.width / 100,
      crop.y * image.height / 100,
      crop.width * image.width / 100,
      crop.height * image.height / 100,
      0,
      0,
      300,
      300
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${Date.now()}-avatar.png`, file);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to upload image. Please try again.",
        });
      } else if (data) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.path);
        setProfileData({
          ...profileData,
          avatar_url: urlData.publicUrl,
        });
      }
    }, 'image/png');

    setIsCropperOpen(false);
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
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar_url} />
                    <AvatarFallback>
                      {profileData.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    Change Avatar
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                  />
                </div>

                <Button onClick={handleProfileUpdate}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add preference settings here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crop Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedImage && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img src={selectedImage} alt="Crop preview" />
                </ReactCrop>
              )}
              <Button onClick={handleCropComplete}>Apply Crop</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}