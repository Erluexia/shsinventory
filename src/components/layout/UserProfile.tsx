import { useState } from "react";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface UserProfileProps {
  onLogout: () => void;
}

export function UserProfile({ onLogout }: UserProfileProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });
  const [profileData, setProfileData] = useState({
    username: "",
    avatar_url: "",
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

    // Create a canvas to draw the cropped image
    const image = new Image();
    image.src = selectedImage;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to 1:1 ratio
    canvas.width = 300;
    canvas.height = 300;

    // Draw the cropped image
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

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'avatar.png', { type: 'image/png' });
      
      // Upload to Supabase Storage
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
      setIsProfileOpen(false);
    }
  };

  return (
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
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

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
                onChange={handleImageSelect}
              />
            </div>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

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
  );
}