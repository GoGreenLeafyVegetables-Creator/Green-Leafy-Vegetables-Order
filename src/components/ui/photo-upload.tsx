
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Camera, Loader2 } from "lucide-react";
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

      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please select an image file (jpg, png, gif, etc.)",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
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

      console.log('Public URL:', publicUrl);

      onPhotoChange(publicUrl);

      toast({
        title: "Photo Uploaded",
        description: "Photo has been uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
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
        const filename = urlParts[urlParts.length - 1];
        const fullPath = folder ? `${folder}/${filename}` : filename;
        
        await supabase.storage
          .from(bucket)
          .remove([fullPath]);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    
    onPhotoChange(null);
    toast({
      title: "Photo Removed",
      description: "Photo has been removed successfully",
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
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg"
            onClick={removePhoto}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
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
          id={`photo-upload-${bucket}`}
        />
        <Label htmlFor={`photo-upload-${bucket}`} className="cursor-pointer">
          <Button type="button" variant="outline" disabled={uploading} asChild>
            <span className="flex items-center">
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Upload Photo"}
            </span>
          </Button>
        </Label>
        {currentPhotoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removePhoto}
            disabled={uploading}
            className="text-red-600 hover:text-red-700"
          >
            Remove
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF. Maximum size: 5MB
      </p>
    </div>
  );
};

export default PhotoUpload;
