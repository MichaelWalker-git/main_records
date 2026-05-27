type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  name?: string;
  email?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const palette = ['bg-navy-500', 'bg-pine-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500'];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function Avatar({ name, email, size = 'sm', className = '' }: AvatarProps) {
  const display = name || email || '?';
  const initialsText = name ? initials(name) : email ? email.slice(0, 2).toUpperCase() : '?';
  const color = colorFor(display);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white flex-shrink-0 ${color} ${sizeStyles[size]} ${className}`}
      title={display}
      data-testid="avatar"
      aria-label={display}
    >
      {initialsText}
    </span>
  );
}

interface UserChipProps {
  name?: string;
  email?: string;
  role?: string;
  size?: AvatarSize;
  className?: string;
}

export function UserChip({ name, email, role, size = 'sm', className = '' }: UserChipProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} data-testid="user-chip">
      <Avatar name={name} email={email} size={size} />
      <span className="text-sm text-slate-700 truncate">{name || email || 'Unknown'}</span>
      {role && <span className="text-[10px] text-slate-400 uppercase tracking-wide">{role}</span>}
    </span>
  );
}
