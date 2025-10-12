import React from 'react';

interface IconCircleProps {
  children?: React.ReactNode;
  /** Diameter in px or any CSS size (e.g. '3rem') */
  size?: number | string;
  /** Icon size in px or CSS size */
  iconSize?: number | string;
  /** Background color - default is accent blue CSS variable */
  bgColor?: string;
  className?: string;
  /** If provided, the element will be exposed to screen readers with this label. Otherwise it will be aria-hidden */
  label?: string;
}

const toCssSize = (v?: number | string) => {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
};

export const IconCircle: React.FC<IconCircleProps> = ({
  children,
  size = 64,
  iconSize = 24,
  bgColor = 'var(--accent-500)',
  className,
  label,
}) => {
  const diameter = toCssSize(size)!;
  const iSize = toCssSize(iconSize)!;

  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
      style={{
        width: diameter,
        height: diameter,
        background: bgColor,
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* If children is an element, try to set its size/color via props, otherwise render as-is */}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            style: { width: iSize, height: iSize },
            className:
              // keep any existing className on the icon but ensure text color is white
              [
                ((children as React.ReactElement<any>).props.className || ''),
                'text-white',
              ]
                .filter(Boolean)
                .join(' '),
          })
        : children}
    </div>
  );
};

export default IconCircle;
