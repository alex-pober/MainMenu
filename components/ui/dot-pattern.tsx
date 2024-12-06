import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 8,
  cy = 8,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();
  const patternId = `pattern-${id}`;

  return (
    <svg
      width="100%"
      height="100%"
      className={cn("absolute inset-0", className)}
      {...props}
    >
      <pattern
        id={patternId}
        x={x}
        y={y}
        width={width}
        height={height}
        patternUnits="userSpaceOnUse"
      >
        <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export default DotPattern;
