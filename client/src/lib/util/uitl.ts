import z from "zod";
import {formatDistanceToNow } from "date-fns";
import type { DateArg } from "date-fns";

export const requiredString = (fieldName: string) => z
    .string(`${fieldName} is required`)
    .min(1, { message: `${fieldName} is required` });

export function timeAgo(date: DateArg<Date>) {
    return formatDistanceToNow(date) + ' ago';
}