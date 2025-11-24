/*
 * Fanalytics - Utility Functions Library
 *
 * This file contains utility functions used throughout the application,
 * including class name merging utilities for Tailwind CSS styling.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
