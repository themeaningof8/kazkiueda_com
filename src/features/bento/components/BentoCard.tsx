import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/utils';

export const BentoCard = ({
  children,
  className,
  title,
  description,
  header,
  icon,
}: {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <Card
    className={cn(
      'flex h-full flex-col justify-between overflow-hidden',
      className,
    )}
  >
    {header ? (
      header
    ) : (
      <>
        {(title || description) && (
          <CardHeader>
            {icon}
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </>
    )}
  </Card>
); 