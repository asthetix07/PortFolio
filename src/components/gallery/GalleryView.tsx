"use client";

import { useEffect, useState, useCallback } from "react";
import { Media, MasonryGrid, Text, Column, Flex, Spinner } from "@once-ui-system/core";
import { supabase } from "@/lib/supabase";

interface DBGalleryImage {
  id: string;
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
  created_at: string;
}

/**
 * Transforms a Cloudinary URL to serve an optimized thumbnail.
 * Inserts f_auto (WebP/AVIF), q_auto (auto quality), and a width cap.
 */
function optimizeCloudinaryUrl(url: string, width: number = 800): string {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}

/**
 * Returns a Cloudinary URL with best-format + auto-quality but NO width cap,
 * so the full-resolution image is delivered in an efficient format.
 */
function fullResCloudinaryUrl(url: string): string {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

export default function GalleryView() {
  const [images, setImages] = useState<DBGalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<DBGalleryImage | null>(null);
  const [fullResLoaded, setFullResLoaded] = useState(false);

  useEffect(() => {
    async function fetchGalleryImages() {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching gallery images from Supabase:", error);
        } else if (data && data.length > 0) {
          setImages(data);
        }
      } catch (err) {
        console.error("Failed to query Supabase gallery:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryImages();
  }, []);

  // Close lightbox on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setLightboxImage(null);
      setFullResLoaded(false);
    }
  }, []);

  useEffect(() => {
    if (lightboxImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxImage, handleKeyDown]);

  function openLightbox(image: DBGalleryImage) {
    setFullResLoaded(false);
    setLightboxImage(image);
  }

  function closeLightbox() {
    setLightboxImage(null);
    setFullResLoaded(false);
  }

  if (loading) {
    return null;
  }

  if (images.length === 0) {
    return (
      <Column fillWidth horizontal="center" paddingY="xl">
        <Text variant="body-default-m" onBackground="neutral-weak">
          No gallery images yet. Add images from the admin panel.
        </Text>
      </Column>
    );
  }

  return (
    <>
      <MasonryGrid columns={2} s={{ columns: 1 }}>
        {images.map((image, index) => {
          const isPriority = index < 4;
          return (
            <div
              key={image.id || index}
              onClick={() => openLightbox(image)}
              style={{ cursor: "zoom-in" }}
            >
              <Media
                priority={isPriority}
                sizes="(max-width: 560px) 100vw, 50vw"
                radius="m"
                aspectRatio={image.orientation === "horizontal" ? "16 / 9" : "3 / 4"}
                src={optimizeCloudinaryUrl(image.src)}
                alt={image.alt}
              />
            </div>
          );
        })}
      </MasonryGrid>

      {/* Full-resolution lightbox overlay */}
      {lightboxImage && (
        <Flex
          center
          position="fixed"
          onClick={closeLightbox}
          style={{
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999,
            backdropFilter: "blur(0.5rem)",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            cursor: "zoom-out",
            animation: "lightbox-fade-in 0.2s ease-out",
          }}
        >
          {/* Loading spinner shown while full-res image loads */}
          {!fullResLoaded && (
            <Flex
              position="absolute"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            >
              <Spinner />
            </Flex>
          )}

          {/* Full-resolution image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullResCloudinaryUrl(lightboxImage.src)}
            alt={lightboxImage.alt}
            onLoad={() => setFullResLoaded(true)}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "var(--radius-m)",
              opacity: fullResLoaded ? 1 : 0,
              transition: "opacity 0.3s ease",
              cursor: "default",
            }}
          />
        </Flex>
      )}

      {/* Lightbox fade-in animation */}
      <style>{`
        @keyframes lightbox-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

