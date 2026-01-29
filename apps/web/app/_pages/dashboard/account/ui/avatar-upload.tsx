"use client";

import type { Crop } from "react-image-crop";
import { useCallback, useRef, useState } from "react";
import { useMutation } from "convex/react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import { toast } from "sonner";

import { api } from "@buildea/convex/_generated/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";
import { Button } from "@buildea/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@buildea/ui/components/dialog";
import { LoadingButton } from "@buildea/ui/components/loading-button";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  name: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function AvatarUpload({ currentAvatarUrl, name }: AvatarUploadProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(
    api.builderProfile.generateAvatarUploadUrl,
  );
  const saveAvatar = useMutation(api.builderProfile.saveAvatar);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImgSrc(result);
        setIsDialogOpen(true);
      }
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
    },
    [],
  );

  const getCroppedImg = async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelRatio = window.devicePixelRatio;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = Math.floor(cropWidth * pixelRatio);
    canvas.height = Math.floor(cropHeight * pixelRatio);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight,
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9,
      );
    });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const blob = await getCroppedImg();
      if (!blob) {
        toast.error("Failed to crop image");
        return;
      }

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = (await response.json()) as { storageId: string };

      // Save the avatar reference
      // @ts-expect-error - Convex types not generated yet
      await saveAvatar({ storageId: data.storageId });

      toast.success("Avatar updated successfully");
      setIsDialogOpen(false);
      setImgSrc("");

      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setImgSrc("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-24 w-24 text-3xl">
        <AvatarImage src={currentAvatarUrl ?? undefined} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
          {name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="hidden"
          id="avatar-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Change Avatar
        </Button>
        <p className="text-muted-foreground text-sm">
          JPG, PNG or GIF. Max 5MB. Recommended 400x400px.
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
            <DialogDescription>
              Drag to reposition and resize your avatar
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- react-image-crop requires native img */}
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-100"
                />
              </ReactCrop>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <LoadingButton
              type="button"
              onClick={handleUpload}
              loading={isUploading}
              disabled={!completedCrop}
            >
              Save Avatar
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
