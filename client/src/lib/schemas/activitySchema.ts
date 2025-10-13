import { z } from "zod";

const requiredString = (fieldName: string) =>
  z
    .string(`${fieldName} is required`)
    .min(1, { message: `${fieldName} is required` });

export const activitySchema = z.object({
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  date: requiredString("Date"),
  location: z.object({
    venue: requiredString("Venue"),
    city: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
});

export type ActivitySchema = z.infer<typeof activitySchema>;
