"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Star, X, FolderPlus } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  menuItems: MenuItem[];
}

interface MenuManagerProps {
  slug: string;
  categories: Category[];
}

// ─── 3D TILT MOUSE TRACKER CARD ──────────────────────────────────────────
function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const springConfig = { damping: 25, stiffness: 250 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.div>
  );
}

function SortableItem({ item }: { item: MenuItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TiltCard
      className="flex items-center gap-3 p-3 rounded-xl bg-[#141414] border border-white/5 hover:border-[#E8FF00]/30 transition-all group"
    >
      <div ref={setNodeRef} style={style} className="flex items-center gap-3 w-full">
        <button
          {...attributes}
          {...listeners}
          className="text-white/20 hover:text-[#E8FF00] cursor-grab active:cursor-grabbing p-1"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {item.imageUrl && (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate text-white/90 group-hover:text-white transition-colors">{item.name}</span>
            {item.isPopular && (
              <Star className="w-3.5 h-3.5 text-[#E8FF00] fill-[#E8FF00] shrink-0" />
            )}
          </div>
          {item.description && (
            <div className="text-xs text-white/35 truncate font-light mt-0.5">
              {item.description}
            </div>
          )}
        </div>
        <div className="text-sm font-bold shrink-0 font-mono text-white/90">
          {formatCurrency(item.price)}
        </div>
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            item.isAvailable ? "bg-[#E8FF00]" : "bg-red-500"
          }`}
        />
      </div>
    </TiltCard>
  );
}

export function MenuManager({ slug, categories: initialCategories }: MenuManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState(
    initialCategories[0]?.id ?? ""
  );

  // Modals visibility
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Forms state
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: activeCategory,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentCategory = categories.find((c) => c.id === activeCategory);
  const items = currentCategory?.menuItems ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeCategory) return cat;
        const oldIndex = cat.menuItems.findIndex((i) => i.id === active.id);
        const newIndex = cat.menuItems.findIndex((i) => i.id === over.id);
        return {
          ...cat,
          menuItems: arrayMove(cat.menuItems, oldIndex, newIndex),
        };
      })
    );
  };

  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const catSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setCategoryForm({ name, slug: catSlug });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      setFormError("Category name and slug are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/restaurants/${slug}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create category");
      }

      const newCategory: Category = {
        id: data.category.id,
        name: data.category.name,
        slug: data.category.slug,
        menuItems: [],
      };

      setCategories((prev) => [...prev, newCategory]);
      setActiveCategory(newCategory.id);
      setItemForm((prev) => ({ ...prev, categoryId: newCategory.id }));
      setCategoryForm({ name: "", slug: "" });
      setShowCategoryModal(false);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const targetCategoryId = itemForm.categoryId || activeCategory;

    if (!itemForm.name.trim() || !itemForm.price || !targetCategoryId) {
      setFormError("Name, price, and category are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/restaurants/${slug}/menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          categoryId: targetCategoryId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create menu item");
      }

      const newItem: MenuItem = {
        id: data.menuItem.id,
        name: data.menuItem.name,
        description: data.menuItem.description,
        price: data.menuItem.price,
        imageUrl: data.menuItem.imageUrl,
        isAvailable: data.menuItem.isAvailable !== false,
        isPopular: data.menuItem.isPopular === true,
        sortOrder: data.menuItem.sortOrder ?? 0,
      };

      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === targetCategoryId) {
            return {
              ...cat,
              menuItems: [...cat.menuItems, newItem],
            };
          }
          return cat;
        })
      );

      setItemForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categoryId: activeCategory,
      });
      setShowItemModal(false);
    } catch (err: unknown) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to create menu item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#E8FF00] font-bold">Menu Architecture</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1 font-cyber-header">Catalog Manager</h1>
          <p className="text-white/40 text-sm mt-1 font-light">
            Organize catalog structures, update prices, and drag items to reorder priority.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="dark" size="sm" className="border border-white/10 hover:border-[#E8FF00]/30 transition-all text-xs" onClick={() => setShowCategoryModal(true)}>
            <FolderPlus className="w-4 h-4" />
            Add Category
          </Button>
          <Button size="sm" className="bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-bold text-xs transition-all" onClick={() => {
            setItemForm(prev => ({ ...prev, categoryId: activeCategory }));
            setShowItemModal(true);
          }} disabled={categories.length === 0}>
            <Plus className="w-4 h-4" />
            Add Dish
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-full md:w-56 shrink-0 space-y-1.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setItemForm((prev) => ({ ...prev, categoryId: cat.id }));
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-between relative ${
                  isActive
                    ? "bg-[#E8FF00]/5 border border-[#E8FF00]/15 text-white font-bold"
                    : "text-white/40 hover:text-white/75 hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="menu-category-active"
                    className="absolute left-0 top-3.5 bottom-3.5 w-0.75 bg-[#E8FF00] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="truncate">{cat.name}</span>
                <span className="text-white/20 text-[10px] font-bold font-mono pl-2">
                  ({cat.menuItems?.length ?? 0})
                </span>
              </button>
            );
          })}
          {categories.length === 0 && (
            <div className="text-center py-8 text-xs text-white/25">
              No categories configured.
            </div>
          )}
        </div>

        {/* Dishes list */}
        <Card className="flex-1 bg-[#0F0F0F] border border-white/5 p-6 rounded-2xl">
          <CardHeader className="px-0 pt-0 pb-4.5 border-b border-white/5 mb-5">
            <CardTitle className="text-base font-bold font-cyber-header text-white">{currentCategory?.name ?? "Items"}</CardTitle>
          </CardHeader>
          {categories.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.03 }}
                    >
                      <SortableItem item={item} />
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-16 text-white/35 text-xs font-light">
                      No dishes in this category. Click &ldquo;Add Dish&rdquo; to begin.
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-16 text-white/35 text-xs font-light">
              Configure a menu category first.
            </div>
          )}
        </Card>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCategoryModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-cyber-header text-white">Create Category</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-white/40 hover:text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={handleCategoryNameChange}
                    placeholder="E.g., Desserts"
                    className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                    placeholder="desserts"
                    className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white font-mono"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white/45 hover:text-white/70"
                  >
                    Cancel
                  </button>
                  <Button type="submit">Save Category</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Menu Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowItemModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-[2rem] p-8 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-cyber-header text-white">Add Menu Item</h3>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-white/40 hover:text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateMenuItem} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={itemForm.name}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="E.g., Rasmalai"
                      className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={itemForm.price}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="8.50"
                      className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    Category Allocation
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-4.5 py-3 rounded-xl bg-[#0F0F0F] border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="E.g., Sweetened cottage cheese patties in cardamom flavored milk..."
                    className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white h-20 resize-none font-light"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/images/rasmalai.jpg"
                    className="w-full px-4.5 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-[#E8FF00] text-sm text-white"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white/45 hover:text-white/70"
                  >
                    Cancel
                  </button>
                  <Button type="submit">Add to Menu</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
