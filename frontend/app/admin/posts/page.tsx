'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Post } from '@/lib/types';
import {
  ArrowLeft,
  Upload,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  CheckCircle,
  AlertCircle,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Sparkles,
  Maximize2,
  FileImage,
  Layers,
  Lock,
} from 'lucide-react';

interface CropSettings {
  aspectRatio: '16:9' | '4:3' | '1:1' | '4:5' | 'custom';
  targetWidth: number;
  targetHeight: number;
  zoom: number; // 1 to 3
  panX: number; // offset in px
  panY: number; // offset in px
  rotation: number; // 0, 90, 180, 270
  quality: number; // 0.7 to 1.0
  format: 'image/webp' | 'image/jpeg';
}

const ASPECT_PRESETS: Record<string, { label: string; desc: string; width: number; height: number; ratio: number }> = {
  '16:9': { label: '16:9 Banner', desc: 'Website hero & card feed (1200 × 675)', width: 1200, height: 675, ratio: 16 / 9 },
  '4:3': { label: '4:3 Classic', desc: 'Standard church bulletin / slide (1000 × 750)', width: 1000, height: 750, ratio: 4 / 3 },
  '1:1': { label: '1:1 Square', desc: 'Social & square feed (800 × 800)', width: 800, height: 800, ratio: 1 },
  '4:5': { label: '4:5 Flyer', desc: 'Portrait poster & mobile view (800 × 1000)', width: 800, height: 1000, ratio: 4 / 5 },
  custom: { label: 'Custom Freeform', desc: 'Define custom pixel dimensions', width: 1080, height: 720, ratio: 1.5 },
};

export default function AdminPostsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'create'>('create');

  // New Post Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Pastor Zerfu');
  const [category, setCategory] = useState<'sermon_poster' | 'pastor_message' | 'building_update' | 'announcement'>('sermon_poster');
  const [content, setContent] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);

  // Image Selection & Resizing State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawImageInfo, setRawImageInfo] = useState<{ width: number; height: number; sizeBytes: number; name: string } | null>(null);
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    aspectRatio: '16:9',
    targetWidth: 1200,
    targetHeight: 675,
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    quality: 0.9,
    format: 'image/webp',
  });
  const [lockAspect, setLockAspect] = useState(true);
  const [resizedPreviewUrl, setResizedPreviewUrl] = useState<string | null>(null);
  const [resizedBlob, setResizedBlob] = useState<string | null>(null);

  // Dragging interaction state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Submission / Loading feedback
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hidden file input ref and Canvas ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load admin token from local storage
  useEffect(() => {
    const saved = localStorage.getItem('hiwot_admin_token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  // Fetch posts once token is available
  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
    setLoadingPosts(false);
  };

  // Handle local image file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedbackMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = document.createElement('img');
      img.onload = () => {
        imageElementRef.current = img;
        setRawImageSrc(src);
        setRawImageInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeBytes: file.size,
          name: file.name,
        });
        // Reset pan & zoom
        setCropSettings((prev) => ({
          ...prev,
          zoom: 1,
          panX: 0,
          panY: 0,
          rotation: 0,
        }));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Change Aspect Ratio Preset
  const handlePresetChange = (presetKey: '16:9' | '4:3' | '1:1' | '4:5' | 'custom') => {
    const preset = ASPECT_PRESETS[presetKey];
    setCropSettings((prev) => ({
      ...prev,
      aspectRatio: presetKey,
      targetWidth: preset.width,
      targetHeight: preset.height,
      panX: 0,
      panY: 0,
      zoom: 1,
    }));
  };

  // Render Resized & Cropped image onto Offscreen/Preview Canvas
  const generateResizedCanvas = useCallback(() => {
    const img = imageElementRef.current;
    if (!img) return;

    const { targetWidth, targetHeight, zoom, panX, panY, rotation, quality, format } = cropSettings;
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    ctx.save();

    // Translate to center of canvas
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute scale so image covers the canvas viewport
    const scaleToCover = Math.max(targetWidth / img.naturalWidth, targetHeight / img.naturalHeight);
    const finalScale = scaleToCover * zoom;

    const drawW = img.naturalWidth * finalScale;
    const drawH = img.naturalHeight * finalScale;

    // Draw centered with user pan offsets
    ctx.drawImage(img, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);

    ctx.restore();

    // Export base64 data
    const dataUrl = canvas.toDataURL(format, quality);
    setResizedPreviewUrl(dataUrl);
    setResizedBlob(dataUrl);
  }, [cropSettings]);

  // Re-generate preview whenever image or crop settings change
  useEffect(() => {
    if (rawImageSrc && imageElementRef.current) {
      generateResizedCanvas();
    }
  }, [rawImageSrc, cropSettings, generateResizedCanvas]);

  // Drag to pan image inside view
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    setCropSettings((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Submit Post & Upload Resized Image
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFeedbackMessage({ type: 'error', text: 'You must be logged in as an administrator.' });
      return;
    }
    if (!title.trim() || !content.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Please fill in the title and description / scripture content.' });
      return;
    }
    if (!resizedBlob && !rawImageSrc) {
      setFeedbackMessage({ type: 'error', text: 'Please select and resize a poster image.' });
      return;
    }

    setIsPublishing(true);
    setFeedbackMessage(null);

    try {
      let finalImageUrl = '/images/sermon_poster.png';

      // 1. Upload Resized Poster Image via base64 endpoint
      if (resizedBlob) {
        const uploadRes = await api.uploadImage(token, {
          image: resizedBlob,
          filename: `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'sermon-poster'}.${cropSettings.format === 'image/webp' ? 'webp' : 'jpg'}`,
        });

        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        } else {
          throw new Error(uploadRes.error || 'Failed to upload poster image to server.');
        }
      }

      // 2. Create the Post in Database
      const postRes = await api.createPost(token, {
        title,
        author,
        category,
        content,
        image_url: finalImageUrl,
        is_featured: isFeatured ? 1 : 0,
      });

      if (postRes.success) {
        setFeedbackMessage({
          type: 'success',
          text: `Poster "${title}" published successfully with custom ${cropSettings.targetWidth}×${cropSettings.targetHeight} dimensions!`,
        });
        // Reset form
        setTitle('');
        setContent('');
        setRawImageSrc(null);
        setResizedPreviewUrl(null);
        setResizedBlob(null);
        loadPosts();
        setActiveView('list');
      } else {
        throw new Error(postRes.error || 'Failed to publish post record.');
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error occurred while saving poster.' });
    }
    setIsPublishing(false);
  };

  // Delete Post
  const handleDeletePost = async (id: number) => {
    if (!token) return;
    if (confirm('Are you sure you want to delete this sermon poster?')) {
      try {
        await api.deletePost(token, id);
        loadPosts();
        setFeedbackMessage({ type: 'success', text: 'Post deleted successfully.' });
      } catch (err: any) {
        setFeedbackMessage({ type: 'error', text: 'Failed to delete post.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy pb-24">
      {/* Top Admin Navigation Header */}
      <header className="bg-navy-dark text-white border-b border-navy-light sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/10 hover:bg-gold hover:text-navy transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
            <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>Pastor Media & Sermon Poster Studio</span>
                <span className="text-[10px] uppercase tracking-wider bg-gold/20 text-gold border border-gold/40 px-2 py-0.5 rounded-full font-sans font-bold">
                  Image Resizer
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView(activeView === 'list' ? 'create' : 'list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'create'
                  ? 'bg-gold text-navy shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {activeView === 'create' ? <Layers className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{activeView === 'create' ? 'View All Posts' : 'Create New Poster'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium animate-in fade-in duration-200 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* 1. CREATE / RESIZE STUDIO VIEW */}
        {activeView === 'create' && (
          <form onSubmit={handlePublishPost} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: POST METADATA */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gold">Step 1</span>
                  <h2 className="font-serif font-bold text-lg text-navy">Poster & Sermon Details</h2>
                  <p className="text-xs text-slate-muted">Enter publication information and sermon scripture</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Poster / Sermon Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Sermon: Walking in the Light (የክርስቶስ ብርሃን)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      Speaker / Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="sermon_poster">Sermon Poster</option>
                      <option value="pastor_message">Pastor's Message</option>
                      <option value="building_update">Building Update</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Scripture Verse & Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Include scripture references (e.g. 1 John 1:7), service time, and sermon introduction summary..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-cream rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-gold leading-relaxed"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 p-3 bg-cream/70 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    id="featuredToggle"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-navy rounded border-slate-300 focus:ring-gold"
                  />
                  <label htmlFor="featuredToggle" className="text-xs font-semibold text-navy cursor-pointer">
                    Show prominently on church website homepage showcase
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="w-full py-3.5 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Resizing & Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-gold group-hover:text-navy" />
                        <span>Publish Resized Poster to Website</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: INTERACTIVE IMAGE SELECTOR & RESIZER STUDIO */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gold">Step 2</span>
                    <h2 className="font-serif font-bold text-lg text-navy">Select & Custom Resize Poster</h2>
                    <p className="text-xs text-slate-muted">Upload any photo and crop/scale precisely to your needed dimensions</p>
                  </div>

                  {rawImageInfo && (
                    <span className="text-[10px] font-mono bg-slate-100 text-slate px-2.5 py-1 rounded-full border border-slate-200">
                      Original: {rawImageInfo.width}×{rawImageInfo.height} px
                    </span>
                  )}
                </div>

                {/* Dropzone / File Picker */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {!rawImageSrc ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-gold hover:bg-cream/40 rounded-3xl p-10 text-center cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="w-14 h-14 bg-cream rounded-2xl flex items-center justify-center mx-auto text-gold group-hover:scale-110 transition-transform shadow-sm">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-navy block group-hover:text-gold transition-colors">
                        Click or drag poster image here to select
                      </strong>
                      <span className="text-xs text-slate-muted block mt-1">
                        Supports high-resolution PNG, JPG, JPEG, and WebP images
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Aspect Ratio Presets */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate mb-2">
                        1. Select Aspect Ratio & Target Resolution
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['16:9', '4:3', '1:1', '4:5'] as const).map((key) => {
                          const item = ASPECT_PRESETS[key];
                          const isSelected = cropSettings.aspectRatio === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handlePresetChange(key)}
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? 'bg-navy text-white border-navy shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate hover:border-gold/50'
                              }`}
                            >
                              <span className="font-bold text-xs block">{item.label}</span>
                              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-gold' : 'text-slate-muted'}`}>
                                {item.width} × {item.height} px
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Dimension Inputs */}
                    <div className="bg-cream/60 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-gold" />
                          Output Dimension Controls
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-muted">
                          <input
                            type="checkbox"
                            id="lockAspect"
                            checked={lockAspect}
                            onChange={(e) => setLockAspect(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-navy"
                          />
                          <label htmlFor="lockAspect" className="cursor-pointer text-[11px]">
                            Lock Ratio
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-muted font-bold mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            value={cropSettings.targetWidth}
                            onChange={(e) => {
                              const val = Math.max(200, parseInt(e.target.value) || 200);
                              setCropSettings((prev) => {
                                const currentRatio = ASPECT_PRESETS[prev.aspectRatio].ratio;
                                return {
                                  ...prev,
                                  targetWidth: val,
                                  targetHeight: lockAspect ? Math.round(val / currentRatio) : prev.targetHeight,
                                };
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-muted font-bold mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            value={cropSettings.targetHeight}
                            onChange={(e) => {
                              const val = Math.max(200, parseInt(e.target.value) || 200);
                              setCropSettings((prev) => {
                                const currentRatio = ASPECT_PRESETS[prev.aspectRatio].ratio;
                                return {
                                  ...prev,
                                  targetHeight: val,
                                  targetWidth: lockAspect ? Math.round(val * currentRatio) : prev.targetWidth,
                                };
                              });
                            }}
                            className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-muted font-bold mb-1">
                            Export Format
                          </label>
                          <select
                            value={cropSettings.format}
                            onChange={(e) =>
                              setCropSettings((prev) => ({ ...prev, format: e.target.value as any }))
                            }
                            className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                          >
                            <option value="image/webp">WebP (Optimized)</option>
                            <option value="image/jpeg">JPEG High-Res</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-muted font-bold mb-1">
                            Quality ({Math.round(cropSettings.quality * 100)}%)
                          </label>
                          <input
                            type="range"
                            min="0.6"
                            max="1.0"
                            step="0.05"
                            value={cropSettings.quality}
                            onChange={(e) =>
                              setCropSettings((prev) => ({ ...prev, quality: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-navy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Cropper Canvas Viewport */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
                          <Crop className="w-3.5 h-3.5 text-gold" />
                          2. Interactive Canvas Crop & Positioning
                        </label>
                        <span className="text-[10px] text-slate-muted">
                          Click & drag to reposition poster subject
                        </span>
                      </div>

                      <div
                        className="relative w-full aspect-[16/9] bg-slate-900 rounded-3xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing border-2 border-slate-300 flex items-center justify-center select-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {resizedPreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resizedPreviewUrl}
                            alt="Crop Preview"
                            className="max-w-full max-h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <span className="text-white/60 text-xs">Rendering crop...</span>
                        )}

                        {/* Interactive overlay instructions badge */}
                        <div className="absolute top-3 left-3 bg-navy-dark/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white flex items-center gap-2 border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Interactive Preview ({cropSettings.targetWidth} × {cropSettings.targetHeight})</span>
                        </div>

                        {/* Re-pick image button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 right-3 px-3 py-1.5 bg-navy/90 hover:bg-gold text-white hover:text-navy text-[10px] font-bold rounded-xl transition-all flex items-center gap-1 shadow"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Change File</span>
                        </button>
                      </div>

                      {/* Zoom and Pan Controls Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 bg-slate-100 p-3 rounded-2xl text-xs">
                        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                          <ZoomOut className="w-4 h-4 text-slate-400" />
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={cropSettings.zoom}
                            onChange={(e) =>
                              setCropSettings((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))
                            }
                            className="w-full accent-gold cursor-pointer"
                          />
                          <ZoomIn className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-xs font-bold text-navy w-12 text-right">
                            {Math.round(cropSettings.zoom * 100)}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCropSettings((prev) => ({
                                ...prev,
                                rotation: (prev.rotation + 90) % 360,
                              }))
                            }
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate hover:text-navy text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Rotate</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setCropSettings((prev) => ({
                                ...prev,
                                zoom: 1,
                                panX: 0,
                                panY: 0,
                                rotation: 0,
                              }))
                            }
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate hover:text-navy text-xs font-semibold transition-all"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LIVE CARD PREVIEW IN SITU */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-gold" />
                          3. Real-Time Website Card Preview
                        </span>
                        <span className="text-[10px] text-slate-muted">
                          How visitors will see this poster on the homepage
                        </span>
                      </div>

                      <div className="max-w-md mx-auto bg-cream rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                        <div className="relative aspect-[16/10] w-full bg-navy-light overflow-hidden">
                          {resizedPreviewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resizedPreviewUrl}
                              alt="Live Card Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              Select an image to preview
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-navy/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold uppercase tracking-wider">
                            {category.replace('_', ' ')}
                          </div>
                        </div>

                        <div className="p-5">
                          <span className="text-[11px] text-slate-muted block mb-1">
                            By {author || 'Pastor Zerfu'}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-navy mb-2 line-clamp-2">
                            {title || 'Your Sermon / Poster Title'}
                          </h4>
                          <p className="text-slate text-xs line-clamp-2 leading-relaxed">
                            {content || 'The scripture reading and message details will appear here.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {/* 2. ALL POSTS LIST VIEW */}
        {activeView === 'list' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-navy">Published Posters & Media</h2>
                <p className="text-xs text-slate-muted">
                  Total published articles, sermon slides, and building posters
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('create')}
                className="px-4 py-2 bg-navy hover:bg-gold text-white hover:text-navy font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Poster</span>
              </button>
            </div>

            {loadingPosts ? (
              <div className="p-12 text-center text-xs text-slate-muted flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-gold" />
                <span>Loading Church Posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-12 text-center text-slate-muted text-xs">
                No posts found. Click "Publish New Poster" to create your first church poster.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-cream rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative h-48 w-full bg-navy-light overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url || '/images/sermon_poster.png'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-navy/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold text-gold uppercase tracking-wider">
                        {post.category.replace('_', ' ')}
                      </div>
                      {post.is_featured === 1 && (
                        <div className="absolute top-2 right-2 bg-gold/90 text-navy px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-muted block">
                          By {post.author}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-navy mt-1 line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-slate text-xs mt-2 line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-muted">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Published'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
