import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Type, AlignLeft, Tag, ArrowLeft, ImagePlus, Users, CheckCircle, Banknote } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageTransition from "@/components/PageTransition";
import { activitiesApi, profilesApi } from "@/lib/api";
import { categoryOptions } from "@/lib/activity-view";
import { getErrorMessage } from "@/lib/error-utils";

type GeoSuggestion = {
  id: string;
  label: string;
  venue: string;
  city: string;
  latitude: string;
  longitude: string;
};

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
    maxParticipants: "20",
    bookingDeadline: "",
    requiresHostConfirmation: "true",
    priceAmount: "0",
    currency: "USD",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [hasResolvedCoordinates, setHasResolvedCoordinates] = useState(false);

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
      maxParticipants: String(editQuery.data.maxParticipants),
      bookingDeadline: editQuery.data.bookingDeadline ? editQuery.data.bookingDeadline.slice(0, 16) : editQuery.data.date.slice(0, 16),
      requiresHostConfirmation: String(editQuery.data.requiresHostConfirmation),
      priceAmount: String(editQuery.data.priceAmount),
      currency: editQuery.data.currency,
    });
    setHasResolvedCoordinates(true);
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

    if (field === "venue" || field === "city") {
      setHasResolvedCoordinates(false);
      setFormData((prev) => ({ ...prev, latitude: "0", longitude: "0" }));
      setShowLocationSuggestions(true);
    }

    if (field === "date") {
      setFormData((prev) => ({
        ...prev,
        bookingDeadline: prev.bookingDeadline || value,
      }));
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    const query = [formData.venue.trim(), formData.city.trim()].filter(Boolean).join(", ");

    if (query.length < 3) {
      setGeoSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }

    const abortController = new AbortController();
    setIsSearchingLocation(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`,
          {
            signal: abortController.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Location lookup failed with status ${response.status}`);
        }

        const data = (await response.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          name?: string;
          address?: {
            city?: string;
            town?: string;
            village?: string;
            municipality?: string;
            county?: string;
            state?: string;
            road?: string;
            house_number?: string;
          };
        }>;

        const suggestions = data.map((item) => {
          const city =
            item.address?.city ??
            item.address?.town ??
            item.address?.village ??
            item.address?.municipality ??
            item.address?.county ??
            item.address?.state ??
            formData.city;

          const road = [item.address?.house_number, item.address?.road].filter(Boolean).join(" ").trim();
          const venue = item.name?.trim() || road || item.display_name.split(",")[0].trim();

          return {
            id: String(item.place_id),
            label: item.display_name,
            venue,
            city,
            latitude: item.lat,
            longitude: item.lon,
          } satisfies GeoSuggestion;
        });

        setGeoSuggestions(suggestions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setGeoSuggestions([]);
        }
      } finally {
        setIsSearchingLocation(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [formData.venue, formData.city]);

  const handleSelectLocation = (suggestion: GeoSuggestion) => {
    setFormData((prev) => ({
      ...prev,
      venue: suggestion.venue,
      city: suggestion.city,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    }));
    setGeoSuggestions([]);
    setShowLocationSuggestions(false);
    setHasResolvedCoordinates(true);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.venue;
      delete next.city;
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
    if (!formData.bookingDeadline) nextErrors.bookingDeadline = "Booking deadline is required";
    if (!formData.maxParticipants || Number(formData.maxParticipants) < 1) {
      nextErrors.maxParticipants = "Max participants must be at least 1";
    }
    if (Number(formData.priceAmount) < 0) {
      nextErrors.priceAmount = "Price cannot be negative";
    }
    if (!formData.currency.trim() || formData.currency.trim().length !== 3) {
      nextErrors.currency = "Currency must be a 3-letter code, e.g. USD";
    }

    if (formData.date && new Date(formData.date).getTime() < Date.now() && !editId) {
      nextErrors.date = "Choose a future date and time";
    }

    if (formData.bookingDeadline && formData.date) {
      if (new Date(formData.bookingDeadline).getTime() > new Date(formData.date).getTime()) {
        nextErrors.bookingDeadline = "Booking deadline must be before activity date";
      }
      if (new Date(formData.bookingDeadline).getTime() < Date.now() && !editId) {
        nextErrors.bookingDeadline = "Booking deadline must be in the future";
      }
    }

    if (!hasResolvedCoordinates) nextErrors.venue = "Choose a suggested location to set coordinates";
    if (Number.isNaN(Number(formData.latitude))) nextErrors.venue = "Could not resolve latitude for this location";
    if (Number.isNaN(Number(formData.longitude))) nextErrors.venue = "Could not resolve longitude for this location";

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const fields = [
    { icon: Type, label: "Activity Title", field: "title", placeholder: "Give your activity a catchy name", type: "text" },
    { icon: AlignLeft, label: "Description", field: "description", placeholder: "Describe what participants can expect...", type: "textarea" },
    { icon: Tag, label: "Category", field: "category", placeholder: "", type: "select" },
    { icon: Calendar, label: "Date & Time", field: "date", placeholder: "", type: "datetime-local" },
    { icon: Calendar, label: "Booking Deadline", field: "bookingDeadline", placeholder: "", type: "datetime-local" },
    { icon: Users, label: "Max Participants", field: "maxParticipants", placeholder: "20", type: "number" },
    { icon: Banknote, label: "Price per Booking", field: "priceAmount", placeholder: "0", type: "number" },
    { icon: Tag, label: "Currency", field: "currency", placeholder: "USD", type: "text" },
    { icon: CheckCircle, label: "Host Confirmation", field: "requiresHostConfirmation", placeholder: "", type: "booking-confirmation" },
    { icon: MapPin, label: "City", field: "city", placeholder: "City", type: "text" },
    { icon: MapPin, label: "Venue", field: "venue", placeholder: "Start typing an address", type: "address-autocomplete" },
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
        maxParticipants: Number(formData.maxParticipants),
        bookingDeadline: formData.bookingDeadline ? new Date(formData.bookingDeadline).toISOString() : null,
        requiresHostConfirmation: formData.requiresHostConfirmation === "true",
        priceAmount: Number(formData.priceAmount),
        currency: formData.currency.trim().toUpperCase(),
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
        await profilesApi.addPhoto(selectedImage);
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
              ) : type === "booking-confirmation" ? (
                <select
                  value={formData.requiresHostConfirmation}
                  onChange={(e) => handleChange("requiresHostConfirmation", e.target.value)}
                  className="w-full bg-muted/30 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="true">Required (host approves/rejects)</option>
                  <option value="false">Not required (auto-approve if slot available)</option>
                </select>
              ) : type === "address-autocomplete" ? (
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setShowLocationSuggestions(false);
                      }, 150);
                    }}
                    placeholder={placeholder}
                    className="bg-muted/30 border-glass-border focus:ring-primary/50"
                  />
                  {showLocationSuggestions && (isSearchingLocation || geoSuggestions.length > 0) && (
                    <div className="absolute z-20 mt-1 w-full rounded-lg border border-glass-border bg-background/95 backdrop-blur-md shadow-lg overflow-hidden">
                      {isSearchingLocation && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Searching locations...</p>
                      )}
                      {!isSearchingLocation && geoSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectLocation(suggestion);
                          }}
                          className="block w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors"
                        >
                          <p className="text-sm font-medium truncate">{suggestion.venue}</p>
                          <p className="text-xs text-muted-foreground truncate">{suggestion.label}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  type={type}
                  min={field === "date" || field === "bookingDeadline" ? minDateTime : field === "maxParticipants" ? "1" : undefined}
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={placeholder}
                  className="bg-muted/30 w-full border-glass-border focus:ring-primary/50
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer
                  [&::-webkit-calendar-picker-indicator]:opacity-80
                  [&::-webkit-calendar-picker-indicator]:invert
                  dark:[&::-webkit-calendar-picker-indicator]:invert-0"
                />
              )}
              {fieldErrors[field] && <p className="text-destructive text-sm mt-2">{fieldErrors[field]}</p>}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.42 }}
            className="rounded-xl border border-glass-border bg-muted/20 p-4"
          >
            <p className="text-sm font-medium">Resolved coordinates</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasResolvedCoordinates
                ? `${formData.latitude}, ${formData.longitude}`
                : "Pick a location suggestion to auto-fill latitude and longitude."}
            </p>
          </motion.div>

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
