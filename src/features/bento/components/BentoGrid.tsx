import { cn } from '@/utils';

export const BentoGrid = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 gap-6 md:grid-cols-8',
        className,
      )}
    >
      {children}
    </div>
  );
}; 