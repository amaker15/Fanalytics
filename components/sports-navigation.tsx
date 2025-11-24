/*
 * Fanalytics - Sports Navigation Component
 *
 * This component provides navigation links between different sports
 * sections (NFL, NBA, NCAA Basketball, NCAA Football, MLB) in the application.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const sports = [
  { name: 'NFL', path: '/', color: 'text-blue-500' },
  { name: 'NBA', path: '/nba', color: 'text-orange-500' },
  { name: 'NCAA BB', path: '/ncaa-basketball', color: 'text-green-500' },
  { name: 'NCAA FB', path: '/ncaa-football', color: 'text-red-500' },
  { name: 'MLB', path: '/mlb', color: 'text-blue-600' },
];

export default function SportsNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {sports.map((sport) => (
        <Link
          key={sport.path}
          href={sport.path}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-colors hover:text-white",
            pathname === sport.path
              ? "text-white border-b-2 border-current"
              : "text-zinc-400"
          )}
        >
          {sport.name}
        </Link>
      ))}
    </nav>
  );
}
