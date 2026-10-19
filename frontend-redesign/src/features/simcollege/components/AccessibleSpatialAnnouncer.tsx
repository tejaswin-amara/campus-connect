import type React from 'react';

interface AccessibleSpatialAnnouncerProps {
  message: string;
}

export const AccessibleSpatialAnnouncer: React.FC<AccessibleSpatialAnnouncerProps> = ({
  message,
}) => {
  return (
    <output
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      data-testid="spatial-announcer"
    >
      {message}
    </output>
  );
};
