import {
  Cctv,
  DoorClosed,
  DoorOpen,
  Flame,
  IdCard,
  KeyRound,
  MapPinned,
  PhoneCall,
  ScanFace,
  Shield,
  Sun,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  cctv: Cctv,
  sun: Sun,
  'key-round': KeyRound,
  'phone-call': PhoneCall,
  'door-open': DoorOpen,
  'door-closed': DoorClosed,
  flame: Flame,
  'scan-face': ScanFace,
  'id-card': IdCard,
  'map-pinned': MapPinned,
  shield: Shield,
};

export const SERVICE_ICON_OPTIONS = Object.keys(ICONS);

export function serviceIcon(name?: string | null): LucideIcon {
  if (!name) return Shield;
  return ICONS[name] ?? Shield;
}

export function ServiceIcon({
  name,
  size = 22,
  className,
  strokeWidth = 1.8,
}: {
  name?: string | null;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = serviceIcon(name);
  return <Icon size={size} className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
