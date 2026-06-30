"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChefHat, ArrowRight, Store, MapPin, Phone, FileText, Globe, AlertCircle, Lock, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMAGE_PRESETS = [
  {
    name: "Classic Bistro",
    url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80",
  },
  {
    name: "Gourmet Burgers",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80",
  },
  {
    name: "Artisan Pizza",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80",
  },
  {
    name: "Cozy Cafe",
    url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&q=80",
    preview: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=200&q=80",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    password: "",
    coverUrl: IMAGE_PRESETS[0].url,
    latitude: null as number | null,
    longitude: null as number | null,
    locationRadius: 100,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Failed to get location. Please enter manually.");
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
    }
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Restaurant name and URL slug are required.");
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required for dashboard access.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register restaurant.");
      }

      // Successful registration, redirect to dashboard
      router.push(`/dashboard/${data.restaurant.slug}`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#E8FF00]/5 rounded-full filter blur-[120px] opacity-60" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-[#9B7EDE]/5 rounded-full filter blur-[100px] opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-[#0F0F0F]/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/5 shadow-2xl relative z-10"
      >
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E8FF00] flex items-center justify-center text-black shadow-lg shadow-[#E8FF00]/10 animate-wiggle">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight font-cyber-header text-white text-cyber-glow">Ordeasy</span>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-cyber-header text-white mb-2">
            Create Your Restaurant
          </h1>
          <p className="text-white/50 text-sm font-light font-cyber-data">
            Launch your smart QR ordering and menu management dashboard in seconds.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 font-cyber-data"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Restaurant Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
                <Store className="w-3.5 h-3.5 text-[#E8FF00]" /> Restaurant Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                placeholder="E.g., Bella Vista"
                className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
                <Globe className="w-3.5 h-3.5 text-[#E8FF00]" /> Custom URL Slug
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-white/40 text-xs select-none font-cyber-data">
                  ordeasy.com/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    }))
                  }
                  placeholder="bella-vista"
                  className="w-full pl-[98px] pr-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm font-medium text-white placeholder-white/20 font-cyber-data"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
              <FileText className="w-3.5 h-3.5 text-[#E8FF00]" /> Tagline / Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="E.g., Modern Italian cuisine with a contemporary twist"
              className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
                <MapPin className="w-3.5 h-3.5 text-[#E8FF00]" /> Address Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="E.g., 2847 Market Street, San Francisco"
                className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
                <Phone className="w-3.5 h-3.5 text-[#E8FF00]" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="E.g., +1 (415) 555-0192"
                className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
              />
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-4 p-4 rounded-xl bg-[#141414]/50 border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
                <Crosshair className="w-3.5 h-3.5 text-[#E8FF00]" /> Location Restriction
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#E8FF00]/10 hover:bg-[#E8FF00]/20 text-[#E8FF00] border border-[#E8FF00]/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isGettingLocation ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-3 h-3" />
                    Auto-detect
                  </>
                )}
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-white/40">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="Auto-detect or enter"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F0F0F] border border-white/5 focus:outline-none focus:border-[#E8FF00] text-xs text-white placeholder-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-white/40">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                  placeholder="Auto-detect or enter"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F0F0F] border border-white/5 focus:outline-none focus:border-[#E8FF00] text-xs text-white placeholder-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-white/40">Radius (meters)</label>
                <input
                  type="number"
                  value={formData.locationRadius}
                  onChange={(e) => setFormData((prev) => ({ ...prev, locationRadius: parseInt(e.target.value) || 100 }))}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-lg bg-[#0F0F0F] border border-white/5 focus:outline-none focus:border-[#E8FF00] text-xs text-white placeholder-white/20"
                />
              </div>
            </div>
            <p className="text-[10px] text-white/30">
              Restrict app usage to customers within this radius of your restaurant location. Leave empty to disable location restriction.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-cyber-header">
              <Lock className="w-3.5 h-3.5 text-[#E8FF00]" /> Dashboard Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Create a password for dashboard access"
              className="w-full px-4.5 py-3 rounded-xl bg-[#141414] border border-white/5 focus:outline-none focus:border-[#E8FF00] focus:ring-1 focus:ring-[#E8FF00]/25 transition-all text-sm text-white placeholder-white/20 font-cyber-data"
            />
          </div>

          {/* Cover Image Preset */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/50 font-cyber-header">
              Choose A Cover Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {IMAGE_PRESETS.map((preset) => {
                const isSelected = formData.coverUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, coverUrl: preset.url }))}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                      isSelected ? "border-[#E8FF00] scale-[1.03] shadow-lg shadow-[#E8FF00]/5" : "border-transparent opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={preset.preview}
                      alt={preset.name}
                      fill
                      className="object-cover"
                      sizes="150px"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span className="text-[10px] text-white font-medium truncate w-full font-cyber-data">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#E8FF00] hover:bg-[#E8FF00]/95 !text-black font-bold uppercase tracking-wider text-sm shadow-xl shadow-[#E8FF00]/10 flex items-center justify-center gap-2 hover:shadow-[#E8FF00]/20 active:scale-98 transition-all rounded-xl font-cyber-data"
            >
              {isLoading ? "Setting up database..." : "Launch Restaurant"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
