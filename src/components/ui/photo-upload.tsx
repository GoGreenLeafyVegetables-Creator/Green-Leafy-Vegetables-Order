
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        toast({
          variant: "destructive",
          title: "No file selected",
          description: "Please select a photo to upload",
        });
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, etc.)",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB",
        });
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('Uploading to bucket:', bucket, 'with filename:', fileName);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      onPhotoChange(publicUrl);

      toast({
        title: "Photo uploaded successfully",
        description: "Your photo has been uploaded and saved",
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload photo. Please try again.",
      });
    } finally {
      setUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const removePhoto = async () => {
    if (currentPhotoUrl) {
      try {
        // Extract filename from URL to delete from storage
        const urlParts = currentPhotoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        if (fileName && fileName !== 'undefined') {
          await supabase.storage
            .from(bucket)
            .remove([`${folder ? folder + '/' : ''}${fileName}`]);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    onPhotoChange(null);
    
    toast({
      title: "Photo removed",
      description: "The photo has been removed successfully",
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Photo</Label>
      
      {currentPhotoUrl ? (
        <div className="relative inline-block">
          <img
            src={currentPhotoUrl}
            alt="Current photo"
            className="w-32 h-32 object-cover rounded-lg border shadow-sm"
            onError={(e) => {
              console.error('Image failed to load:', currentPhotoUrl);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 shadow-md"
            onClick={removePhoto}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
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
      
      {uploading && (
        <div className="text-sm text-gray-600">
          Uploading photo, please wait...
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
