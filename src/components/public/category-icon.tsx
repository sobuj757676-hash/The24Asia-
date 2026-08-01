import {
  Brush,
  CalendarDays,
  Droplet,
  GraduationCap,
  HardHat,
  Handshake,
  Leaf,
  Megaphone,
  MonitorSmartphone,
  Music,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

/**
 * Category-specific icons for card covers.
 *
 * Every course cover previously showed the same graduation cap and every event
 * the same calendar, so a grid of eight cards carried no information in its
 * imagery. Matching the icon to the category makes the grid scannable at a
 * glance, which is most of what a cover image would have done anyway.
 *
 * The maps hold render functions rather than component references: looking a
 * component up and assigning it to a capitalised local would be "creating a
 * component during render" as far as the react-hooks lint rules are concerned.
 */
type Render = (className: string) => React.ReactElement;

const COURSE_ICONS: Record<string, Render> = {
  digital_literacy: (c) => <MonitorSmartphone className={c} />,
  digital: (c) => <MonitorSmartphone className={c} />,
  creative: (c) => <Brush className={c} />,
  design: (c) => <Brush className={c} />,
  communication: (c) => <Megaphone className={c} />,
  language: (c) => <Megaphone className={c} />,
  safety: (c) => <HardHat className={c} />,
  wsh: (c) => <HardHat className={c} />,
  literacy: (c) => <GraduationCap className={c} />,
  numeracy: (c) => <GraduationCap className={c} />,
  finance: (c) => <GraduationCap className={c} />,
};

const EVENT_ICONS: Record<string, Render> = {
  blood_donation: (c) => <Droplet className={c} />,
  environment: (c) => <Leaf className={c} />,
  culture: (c) => <Sparkles className={c} />,
  entertainment: (c) => <Music className={c} />,
  sport: (c) => <Trophy className={c} />,
  team_building: (c) => <Users className={c} />,
  education: (c) => <GraduationCap className={c} />,
  partner: (c) => <Handshake className={c} />,
  volunteer_only: (c) => <Users className={c} />,
};

function normalise(category?: string | null) {
  return category ? category.toLowerCase().replace(/[\s-]+/g, "_") : "";
}

export function CourseIcon({
  category,
  className = "size-8",
}: {
  category?: string | null;
  className?: string;
}) {
  const render = COURSE_ICONS[normalise(category)];
  return render ? render(className) : <GraduationCap className={className} />;
}

export function EventIcon({
  category,
  className = "size-8",
}: {
  category?: string | null;
  className?: string;
}) {
  const render = EVENT_ICONS[normalise(category)];
  return render ? render(className) : <CalendarDays className={className} />;
}
