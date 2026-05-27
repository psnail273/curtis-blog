import {
  FileCode,
  Video,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';
import type { FileType } from '@/types/file';

interface FileIconProps {
  type: FileType;
  className?: string;
  size?: number;
}

const iconMap: Record<FileType, React.ComponentType<{ className?: string; size?: number }>> = {
  code: FileCode,
  video: Video,
  pdf: FileText,
  image: ImageIcon,
  document: FileSpreadsheet,
  other: HelpCircle,
};

/**
 * Maps a FileType to the appropriate Lucide React icon.
 */
export function FileIcon({ type, className, size = 20 }: FileIconProps) {
  const Icon = iconMap[type] ?? HelpCircle;
  return <Icon className={className} size={size} aria-hidden="true" />;
}
