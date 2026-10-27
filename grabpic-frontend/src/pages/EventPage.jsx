import { useParams } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { searchImages, downloadAllImages, getEventStatus } from "../api/client";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import RetroButton from "../components/RetroButton";
import DropZone from "../components/DropZone";
import SkeletonGrid from "../components/SkeletonGrid";
import ImageModal from "../components/ImageModal";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export default function EventPage() {
  const { eventId } = useParams();

  const [files, setFiles] = useState([]);
  const [images, setImages] = useState({ strong: [], weak: [] });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [eventStatus, setEventStatus] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [allImagesFlat, setAllImagesFlat] = useState([]);

  const observerRef = useRef();

  // Check event indexing status on load
  useEffect(() => {
    if (eventId) {
      getEventStatus(eventId)
        .then((res) => setEventStatus(res.data?.status))
        .catch(() => {});
    }
  }, [eventId]);

  // ---- FILE HANDLER (BUFFERED) ----
  const handleFiles = (fileList) => {
    if (fileList.length === 0) return;
    
    // Append new files and limit to 4
    setFiles((prev) => {
      const combined = [...prev, ...fileList];
      if (combined.length > 4) {
        return combined.slice(0, 4);
      }
      return combined;
    });

    // Reset results when building a new query
    setImages({ strong: [], weak: [] });
    setAllImagesFlat([]);
    setPage(1);
    setHasMore(false);
    setHasSearched(false);
    setSearchError("");
  };

  // ---- SEARCH ----
  const performSearch = async (fileSet, pageNum) => {
    try {
      setLoading(true);
      setSearchError("");
      const formData = new FormData();
      fileSet.forEach((f) => formData.append("files", f));

      const res = await searchImages(eventId, formData, pageNum, 12);
      const strong = res.data?.strongMatches || [];
      const weak = res.data?.weakMatches || [];

      if (pageNum === 1) {
        setImages({ strong, weak });
        setAllImagesFlat([...strong, ...weak]);
      } else {
        setImages((prev) => ({
          strong: [...prev.strong, ...strong],
          weak: [...prev.weak, ...weak],
        }));
        setAllImagesFlat((prev) => [...prev, ...strong, ...weak]);
      }

      setPage(pageNum + 1);
      setHasMore(!!res.data?.hasMore);
      setHasSearched(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Search failed. Ensure your face is clearly visible and try again.";
      setSearchError(msg);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ---- LOAD MORE ----
  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    performSearch(files, page);
  }, [hasMore, loading, files, page]);

  // ---- INTERSECTION OBSERVER ----
  const lastImageRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMore();
      });

      if (node) observerRef.current.observe(node);
    },
    [loadMore]
  );

  // ---- DOWNLOAD ALL ----
  const downloadAll = () => {
    downloadAllImages(eventId);
  };

  // ---- HELPERS ----
  const hasResults = images.strong.length > 0 || images.weak.length > 0;

  return (
    <PageWrapper>
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: "24px",
          color: "var(--accent-cyan)",
          textShadow: "0 0 12px rgba(0, 255, 224, 0.4)",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        FIND YOUR PHOTOS
      </motion.h2>

      {/* Status Warning if Still Indexing */}
      {eventStatus === "processing" && (
        <motion.div {...fadeUp} className="card w-full mb-24 text-center" style={{ borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }}>
          <p style={{ fontSize: "13px", letterSpacing: "0.05em" }}>
            ⚡ Photos for this event are currently being indexed by AI. You can still search, but some photos may appear once indexing is complete.
          </p>
        </motion.div>
      )}

      {/* Upload Zone */}
      <motion.div {...fadeUp} className="w-full mb-24">
        <DropZone
          label="Upload Your Selfie"
          sublabel="Select 1–4 photos (2–4 photos recommended for best accuracy)"
          maxFiles={4}
          onFiles={handleFiles}
          accept="image/*"
          files={files}
          onClear={() => setFiles([])}
        />
      </motion.div>

      {/* Search Button & Feedback */}
      <motion.div {...fadeUp} className="flex flex-col items-center mb-32">
        {files.length > 0 && (
          <p 
            style={{ 
              fontSize: "14px", 
              color: files.length < 2 ? "var(--text-muted)" : "var(--accent-cyan)",
              marginBottom: "16px",
              letterSpacing: "0.05em"
            }}
          >
            {files.length === 1 
              ? "1 photo selected (adding 1–2 more can improve accuracy)" 
              : `${files.length} photos ready for multi-angle matching`}
          </p>
        )}
        <RetroButton 
          variant="primary" 
          onClick={() => performSearch(files, 1)}
          disabled={files.length < 1 || loading}
          style={{ minWidth: "200px" }}
        >
          {loading ? "Searching..." : "🔍 Search My Photos"}
        </RetroButton>
      </motion.div>

      {/* Search Error */}
      {searchError && (
        <motion.div {...fadeUp} className="card w-full mb-24 text-center" style={{ borderColor: "var(--accent-magenta)", color: "var(--accent-magenta)" }}>
          <p style={{ fontSize: "14px" }}>{searchError}</p>
        </motion.div>
      )}

      {/* No Matches Found */}
      {hasSearched && !loading && !hasResults && !searchError && (
        <motion.div {...fadeUp} className="card w-full mb-32 text-center" style={{ maxWidth: "500px", margin: "0 auto 32px" }}>
          <p style={{ color: "var(--accent-magenta)", fontSize: "16px", fontWeight: "bold", letterSpacing: "0.1em", marginBottom: "8px" }}>
            NO MATCHES FOUND
          </p>
          <p className="text-muted" style={{ fontSize: "13px", lineHeight: "1.6" }}>
            We could not find any photos matching your selfie in this event. Ensure your face is clearly visible, well-lit, and try uploading another selfie from a different angle.
          </p>
        </motion.div>
      )}

      {/* Download All */}
      {hasResults && (
        <motion.div {...fadeUp} className="mb-24" style={{ textAlign: "center" }}>
          <RetroButton variant="secondary" onClick={downloadAll}>
            ↓ Download All Photos
          </RetroButton>
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <motion.div {...fadeUp} className="w-full mb-24">
          <SkeletonGrid count={8} />
        </motion.div>
      )}

      {/* Strong Matches */}
      {images.strong.length > 0 && (
        <motion.section {...fadeUp} className="w-full mb-32">
          <h3 className="section-title section-title--cyan">YOUR PHOTOS</h3>
          <div className="image-grid">
            {images.strong.map((img, idx) => {
              const flatIndex = idx;
              const isLast =
                idx === images.strong.length - 1 &&
                images.weak.length === 0;

              return (
                <div
                  key={`s-${idx}`}
                  ref={isLast ? lastImageRef : null}
                  className="image-grid__item image-grid__item--cyan"
                  onClick={() => setSelectedIndex(flatIndex)}
                >
                  <img
                    src={img.url}
                    alt={`Match ${idx + 1}`}
                    className="image-grid__img"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Weak Matches */}
      {images.weak.length > 0 && (
        <motion.section {...fadeUp} className="w-full mb-32">
          <h3 className="section-title section-title--magenta">MAYBE YOU</h3>
          <div className="image-grid">
            {images.weak.map((img, idx) => {
              const flatIndex = images.strong.length + idx;
              const isLast = idx === images.weak.length - 1;

              return (
                <div
                  key={`w-${idx}`}
                  ref={isLast ? lastImageRef : null}
                  className="image-grid__item image-grid__item--magenta"
                  onClick={() => setSelectedIndex(flatIndex)}
                >
                  <img
                    src={img.url}
                    alt={`Maybe ${idx + 1}`}
                    className="image-grid__img"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Image Modal */}
      <ImageModal
        images={allImagesFlat}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={setSelectedIndex}
        getImageSrc={(img) => img.url}
        getDownloadHref={(img) => img.url}
      />
    </PageWrapper>
  );
}
