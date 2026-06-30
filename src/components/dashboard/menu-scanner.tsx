"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";

interface ParsedMenuItem {
  name: string;
  price: number;
  description?: string;
  category?: string;
}

interface MenuScannerProps {
  slug: string;
  categories: { id: string; name: string }[];
  onItemsAdded: (items: ParsedMenuItem[]) => void;
}

export function MenuScanner({ slug, categories, onItemsAdded }: MenuScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedMenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "");
  const [detectedCategories, setDetectedCategories] = useState<string[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const text = result.data.text;
      const cleanedText = cleanText(text);
      const { items, detectedCategories } = parseMenuTextWithCategories(cleanedText);
      setParsedItems(items);
      setDetectedCategories(detectedCategories);
      
      // Auto-map detected categories to existing categories by similarity
      const mappings: Record<string, string> = {};
      detectedCategories.forEach(detected => {
        const matched = categories.find(cat => 
          cat.name.toLowerCase().includes(detected.toLowerCase()) ||
          detected.toLowerCase().includes(cat.name.toLowerCase())
        );
        if (matched) {
          mappings[detected] = matched.id;
        }
      });
      setCategoryMappings(mappings);
      
      if (detectedCategories.length > 0) {
        console.log("Detected categories:", detectedCategories);
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanText = (text: string): string => {
    // Preserve line structure for better item separation
    return text
      .replace(/[^\w\s\$\.\,\-\(\)\:\/\n]/g, '') // Keep newlines!
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/[ \t]+/g, ' ') // Normalize spaces within lines
      .replace(/\n\s*\n/g, '\n') // Remove empty lines but keep single newlines
      .trim();
  };

  const parseMenuTextWithCategories = (text: string): { items: ParsedMenuItem[]; detectedCategories: string[] } => {
    // Split by newlines and filter empty lines
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const items: ParsedMenuItem[] = [];
    const detectedCategories: string[] = [];
    
    // Price patterns - more specific to avoid false matches
    const pricePatterns = [
      /\$(\d+\.\d{2})\b/,  // $12.99 at end of word
      /(\d+\.\d{2})\$/,   // 12.99$ at end of word
      /\b(\d+\.\d{2})\b/, // 12.99 as word boundary
      /\$(\d+)\b/,        // $12 at end
      /(\d+)\$\b/,        // 12$ at end
    ];
    
    // Category pattern - all caps, reasonable length, no numbers
    const categoryPattern = /^[A-Z][A-Z\s]{2,30}$/;
    
    let currentCategory: string | null = null;
    let skipNextLine = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }

      // Check for category first
      if (categoryPattern.test(line) && line.length < 50 && line.split(' ').length <= 4) {
        currentCategory = line;
        if (!detectedCategories.includes(line)) {
          detectedCategories.push(line);
        }
        continue;
      }

      // Find price in line - use first match
      let priceMatch = null;
      let price = 0;
      
      for (const pattern of pricePatterns) {
        const match = line.match(pattern);
        if (match) {
          priceMatch = match;
          price = parseFloat(match[1]);
          break;
        }
      }

      // If we have a price, extract the item
      if (priceMatch && price > 0) {
        // Split line by price and take the part before as name
        const parts = line.split(priceMatch[0]);
        let name = parts[0].trim();
        
        // Also check if there's content after the price (some menus have name first, then price)
        if (name.length < 3 && parts.length > 1) {
          name = parts.slice(1).join(' ').trim();
        }
        
        // Clean name
        name = name.replace(/^[\.\-\s,]+/, '').replace(/[\.\-\s,]+$/, '').trim();
        
        // Skip invalid names
        if (name.length < 2 || /^\d+$/.test(name) || name.length > 100) {
          continue;
        }
        
        // Look for description on next line
        let description = undefined;
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextHasPrice = pricePatterns.some(p => p.test(nextLine));
          const nextIsCategory = categoryPattern.test(nextLine);
          
          if (!nextHasPrice && !nextIsCategory && nextLine.length > 5 && nextLine.length < 150) {
            description = nextLine;
            skipNextLine = true;
          }
        }
        
        items.push({
          name,
          price,
          description,
          category: currentCategory || undefined,
        });
      }
    }

    return { items, detectedCategories };
  };

  const addItemsToMenu = async () => {
    if (parsedItems.length === 0) return;

    try {
      for (const item of parsedItems) {
        // Use mapped category if available, otherwise use selected category
        const categoryId = item.category && categoryMappings[item.category] 
          ? categoryMappings[item.category] 
          : selectedCategory;

        const res = await fetch(`/api/restaurants/${slug}/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            description: item.description,
            price: item.price,
            categoryId,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to add ${item.name}`);
        }
      }

      onItemsAdded(parsedItems);
      closeScanner();
    } catch (err) {
      console.error("Error adding items:", err);
      setError("Failed to add items to menu. Please try again.");
    }
  };

  const closeScanner = () => {
    setIsOpen(false);
    setImage(null);
    setParsedItems([]);
    setDetectedCategories([]);
    setCategoryMappings({});
    setProgress(0);
    setError(null);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="dark"
        size="sm"
        className="border border-white/10 hover:border-[#E8FF00]/30 transition-all text-xs"
      >
        <Camera className="w-4 h-4 mr-2" />
        Scan Menu
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={closeScanner}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-cyber-header text-white">
                  Menu Scanner
                </h3>
                <button
                  onClick={closeScanner}
                  className="text-white/40 hover:text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!image ? (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-[#E8FF00]/30 transition-colors)">
                    <Camera className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/50 text-sm mb-4">
                      Upload a photo of your menu to automatically extract items
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={image}
                      alt="Menu"
                      className="w-full rounded-xl border border-white/5"
                    />
                    <button
                      onClick={() => setImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/75 flex items-center justify-center text-white hover:bg-black transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!isProcessing && parsedItems.length === 0 && (
                    <Button
                      onClick={processImage}
                      className="w-full bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Extract Menu Items
                    </Button>
                  )}

                  {isProcessing && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-[#E8FF00]" />
                        <span className="text-white/70 text-sm">
                          Processing image... {progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8FF00] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {parsedItems.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">
                          Found {parsedItems.length} items
                        </h4>
                        {detectedCategories.length > 0 && (
                          <span className="text-xs text-[#E8FF00]">
                            {detectedCategories.length} categories detected
                          </span>
                        )}
                      </div>

                      {/* Category Mapping Section */}
                      {detectedCategories.length > 0 && (
                        <div className="bg-[#141414] rounded-lg p-4 border border-white/5">
                          <h5 className="text-xs font-bold text-white/70 uppercase mb-3">
                            Map Detected Categories
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {detectedCategories.map((detectedCat) => (
                              <div key={detectedCat} className="flex items-center gap-2">
                                <span className="text-sm text-white/70 flex-1">
                                  {detectedCat}
                                </span>
                                <select
                                  value={categoryMappings[detectedCat] || selectedCategory}
                                  onChange={(e) => setCategoryMappings(prev => ({
                                    ...prev,
                                    [detectedCat]: e.target.value
                                  }))}
                                  className="bg-[#0F0F0F] border border-white/5 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#E8FF00]"
                                >
                                  {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Default Category Selection */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white/50">Default category:</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="bg-[#141414] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E8FF00]"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {parsedItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-white/5"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-white text-sm">
                                  {item.name}
                                </div>
                                {item.category && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#E8FF00]/10 text-[#E8FF00]">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-white/50 text-xs mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <div className="font-bold text-[#E8FF00] text-sm">
                              ${item.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setParsedItems([]);
                            setDetectedCategories([]);
                            setCategoryMappings({});
                          }}
                          variant="dark"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addItemsToMenu}
                          className="flex-1 bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Add All Items
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
