"use client";

import { useCallback, useRef, useState } from "react";

interface UploadedFile {
  file: File;
  preview: string;
}

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploaded({ file, preview: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleClear = () => {
    setUploaded(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (uploaded) {
    return (
      <div className="relative w-full max-w-lg mx-auto border border-[#d4af37]/40 bg-[#111]">
        {/* Corner ornaments */}
        <span className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#d4af37]" />
        <span className="absolute top-2 right-2 w-5 h-5 border-t border-r border-[#d4af37]" />
        <span className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-[#d4af37]" />
        <span className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#d4af37]" />

        <div className="p-6">
          {/* Preview */}
          <div className="relative overflow-hidden mb-4 bg-[#0a0a0a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploaded.preview}
              alt="Your pet"
              className="w-full max-h-64 object-contain"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[#d4af37]/20 pointer-events-none" />
          </div>

          {/* File info */}
          <div className="flex items-center gap-3 mb-5 px-1">
            <svg
              className="w-4 h-4 text-[#d4af37] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M13.5 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-[#f5f5f0] text-sm truncate">{uploaded.file.name}</p>
              <p className="text-[#888] text-xs">
                {(uploaded.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={handleClear}
              aria-label="Remove image"
              className="text-[#888] hover:text-[#d4af37] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button className="w-full bg-[#d4af37] text-black py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-[#f0d060] transition-colors duration-300">
            Begin the Transformation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload pet photo"
      className={`
        relative w-full max-w-lg mx-auto cursor-pointer select-none
        border-2 border-dashed p-16 text-center
        transition-all duration-300
        ${
          isDragging
            ? "border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]"
            : "border-[#d4af37]/35 hover:border-[#d4af37]/70 hover:bg-[#d4af37]/5"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
      />

      {/* Corner ornaments */}
      <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#d4af37]" />
      <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#d4af37]" />
      <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#d4af37]" />
      <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#d4af37]" />

      {/* Upload icon */}
      <div className="mb-5 flex justify-center">
        <div
          className={`w-16 h-16 rounded-full border border-[#d4af37]/40 flex items-center justify-center transition-colors duration-300 ${
            isDragging ? "border-[#d4af37] bg-[#d4af37]/20" : ""
          }`}
        >
          <svg
            className="w-7 h-7 text-[#d4af37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
      </div>

      <p className="font-playfair text-xl text-[#f5f5f0] mb-2">
        {isDragging ? "Release to Upload" : "Drop Your Portrait Here"}
      </p>
      <p className="text-[#888] text-sm mb-5">or click to browse your gallery</p>
      <p className="text-[#d4af37]/50 text-xs tracking-[0.2em] uppercase">
        JPG · PNG · WEBP &nbsp;·&nbsp; Max 10 MB
      </p>
    </div>
  );
}
