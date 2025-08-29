
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  bucket: string;
  folder?: string;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  bucket,
  folder = "",
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder ? folder + '/' : ''}${Math.random()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onPhotoChange(publicUrl);

      toast({
        title: "Photo uploaded",
        description: "Photo has been uploaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload photo",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onPhotoChange(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Photo</Label>
      
      {currentPhotoUrl ? (
        <div className="relative inline-block">
          <img
            src={currentPhotoUrl}
            alt="Current photo"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={removePhoto}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <Camera className="h-8 w-8 text-gray-400" />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept="image/*"
          onChange={uploadPhoto}
          disabled={uploading}
          className="hidden"
          id="photo-upload"
        />
        <Label htmlFor="photo-upload" className="cursor-pointer">
          <Button type="button" variant="outline" disabled={uploading} asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Photo"}
            </span>
          </Button>
        </Label>
      </div>
    </div>
  );
};

export default PhotoUpload;
