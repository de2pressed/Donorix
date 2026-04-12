"use client";

import { ImagePlus } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="rounded-[1.5rem] border border-dashed border-border p-4">
      <input ref={inputRef} className="hidden" accept="image/*" type="file" />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <ImagePlus className="size-4" />
        Upload profile image
      </Button>
      <p className="mt-2 text-sm text-muted-foreground">
        Use JPG, PNG, or WebP under 5 MB. Storage validation is enforced server-side.
      </p>
    </div>
  );
}
