import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Type, AlignLeft, Tag, ArrowLeft, ImagePlus } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageTransition from "@/components/PageTransition";
import { activitiesApi } from "@/lib/api";
import { categoryOptions } from "@/lib/activity-view";
import { getErrorMessage } from "@/lib/error-utils";

const CreateActivity = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    city: "",
    venue: "",
    latitude: "0",
    longitude: "0",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const minDateTime = useMemo(() => new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16), []);

  const editQuery = useQuery({
    queryKey: ["activity-form", editId],
    queryFn: () => activitiesApi.details(editId!),
    enabled: Boolean(editId),
  });

  useEffect(() => {
    if (!editQuery.data) return;
    setFormData({
      title: editQuery.data.title,
      description: editQuery.data.description,
      category: editQuery.data.category,
      date: editQuery.data.date.slice(0, 16),
      city: editQuery.data.city,
      venue: editQuery.data.venue,
      latitude: String(editQuery.data.latitude),
      longitude: String(editQuery.data.longitude),
    });
    setImagePreview(editQuery.data.imageUrl ?? null);
  }, [editQuery.data]);

  useEffect(() => {
    if (!selectedImage) return undefined;

    const nextPreview = URL.createObjectURL(selectedImage);
    setImagePreview(nextPreview);

    return () => URL.revokeObjectURL(nextPreview);
  }, [selectedImage]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) nextErrors.title = "Title is required";
    if (!formData.description.trim()) nextErrors.description = "Description is required";
    if (!formData.category.trim()) nextErrors.category = "Category is required";
    if (!formData.city.trim()) nextErrors.city = "City is required";
    if (!formData.venue.trim()) nextErrors.venue = "Venue is required";
    if (!formData.date) nextErrors.date = "Date and time are required";

    if (formData.date && new Date(formData.date).getTime() < Date.now() && !editId) {
      nextErrors.date = "Choose a future date and time";
    }

    if (Number.isNaN(Number(formData.latitude))) nextErrors.latitude = "Latitude must be a number";
    if (Number.isNaN(Number(formData.longitude))) nextErrors.longitude = "Longitude must be a number";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fields = [
    { icon: Type, label: "Activity Title", field: "title", placeholder: "Give your activity a catchy name", type: "text" },
    { icon: AlignLeft, label: "Description", field: "description", placeholder: "Describe what participants can expect...", type: "textarea" },
    { icon: Tag, label: "Category", field: "category", placeholder: "", type: "select" },
    { icon: Calendar, label: "Date & Time", field: "date", placeholder: "", type: "datetime-local" },
    { icon: MapPin, label: "City", field: "city", placeholder: "City", type: "text" },
    { icon: MapPin, label: "Venue", field: "venue", placeholder: "Venue", type: "text" },
    { icon: MapPin, label: "Latitude", field: "latitude", placeholder: "0", type: "number" },
    { icon: MapPin, label: "Longitude", field: "longitude", placeholder: "0", type: "number" },
  ];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        city: formData.city,
        venue: formData.venue,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      if (editId) {
        await activitiesApi.edit(editId, payload);
        if (selectedImage) {
          await activitiesApi.uploadPhoto(editId, selectedImage);
        }
        return editId;
      }

      const activityId = await activitiesApi.create(payload);

      if (selectedImage) {
        await activitiesApi.uploadPhoto(activityId, selectedImage);
      }

      return activityId;
    },
    onSuccess: async (activityId) => {
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      await queryClient.invalidateQueries({ queryKey: ["activity", activityId] });
      navigate(`/activity/${activityId}`);
    },
    meta: { skipToast: true },
  });

  return (
    <PageTransition>
      <div className="pt-24 pb-20 container mx-auto px-6 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to activities
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">
            {editId ? "Edit Activity" : "Create Activity"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {editId
              ? "Update your activity details"
              : "Share something amazing with the community"}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-8 rounded-2xl space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!validateForm()) return;
            saveMutation.mutate();
          }}
        >
          {fields.map(({ icon: Icon, label, field, placeholder, type }, i) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Icon className="w-4 h-4 text-primary" /> {label}
              </label>
              {type === "textarea" ? (
                <Textarea
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="bg-muted/30 border-glass-border focus:ring-primary/50 min-h-[100px] resize-none"
                />
              ) : type === "select" ? (
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full bg-muted/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={type}
                  min={field === "date" ? minDateTime : undefined}
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="bg-muted/30 border-glass-border focus:ring-primary/50"
                />
              )}
              {fieldErrors[field] && <p className="text-destructive text-sm mt-2">{fieldErrors[field]}</p>}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <ImagePlus className="w-4 h-4 text-primary" /> Cover Photo
            </label>
            <label className="block rounded-xl border border-dashed border-glass-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setSelectedImage(file);
                }}
              />
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Activity preview"
                    className="w-full h-48 rounded-lg object-cover"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedImage ? `Selected: ${selectedImage.name}` : "Current activity photo"}
                  </p>
                </div>
              ) : (
                <div className="h-40 rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
                  Click to choose a cover image
                </div>
              )}
            </label>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-xl bg-muted/20 border border-glass-border p-4">
            <p className="text-sm font-medium mb-1">Map preview</p>
            <p className="text-sm text-muted-foreground mb-3">
              {formData.venue && formData.city
                ? `${formData.venue}, ${formData.city}`
                : "Add venue and city to preview the map link."}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${formData.city},${formData.venue}`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm hover:underline"
            >
              Open coordinates in Google Maps
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-4">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full gradient-primary text-primary-foreground border-0 glow-primary py-3 text-base font-semibold"
              >
                {saveMutation.isPending ? "Saving..." : editId ? "Save Changes" : "Create Activity"}
              </Button>
            </motion.div>
            {saveMutation.isError && (
              <p className="text-destructive text-sm mt-3">{getErrorMessage(saveMutation.error, "Failed to save activity.")}</p>
            )}
          </motion.div>
        </motion.form>
      </div>
    </PageTransition>
  );
};

export default CreateActivity;
