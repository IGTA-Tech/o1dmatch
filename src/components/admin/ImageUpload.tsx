// src/components/admin/ImageUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  ImageIcon,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";

interface ImageUploadProps {
  value: string; // current image URL
  onChange: (url: string) => void;
  onPathChange?: (path: string | null) => void; // storage path for deletion
}

export default function ImageUpload({
  value,
  onChange,
  onPathChange,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError("");

      // Client-side validation
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      if (!allowed.includes(file.type)) {
        setError("Invalid file type. Use JPEG, PNG, WebP, GIF, or SVG.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File too large. Maximum 5MB.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Upload failed");
          return;
        }

        onChange(data.url);
        setStoragePath(data.path);
        onPathChange?.(data.path);
        setShowUrlInput(false);
        setUrlInput("");
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [onChange, onPathChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = async () => {
    // If it was uploaded to our bucket, delete it
    if (storagePath) {
      try {
        await fetch(`/api/admin/upload?path=${encodeURIComponent(storagePath)}`, {
          method: "DELETE",
        });
      } catch {
        // Ignore delete errors, still clear the URL
      }
    }
    onChange("");
    setStoragePath(null);
    onPathChange?.(null);
    setError("");
  };

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (url) {
      onChange(url);
      setStoragePath(null);
      onPathChange?.(null);
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUrlSubmit();
    }
    if (e.key === "Escape") {
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Featured Image
      </label>

      {/* Current Image Preview */}
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative w-full" style={{ maxHeight: "280px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Featured image preview"
              className="w-full h-auto object-cover"
              style={{ maxHeight: "280px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-medium shadow hover:bg-gray-50 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium shadow hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Remove
            </button>
          </div>

          {/* URL display */}
          <div className="px-3 py-2 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-400 truncate font-mono">{value}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            } ${uploading ? "pointer-events-none opacity-70" : ""}`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-gray-100 rounded-full mb-3">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  Drop an image here, or{" "}
                  <span className="text-blue-600">click to browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP, GIF, SVG &middot; Max 5MB
                </p>
              </>
            )}
          </div>

          {/* OR divider + URL input toggle */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {showUrlInput ? (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={handleUrlKeyDown}
                placeholder="https://example.com/image.jpg"
                autoFocus
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
              Use image URL instead
            </button>
          )}
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}