import { PacmanLoader } from "react-spinners";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
  /**
   * Loading message to display below the spinner
   */
  message?: string;
  /**
   * Color of the PacmanLoader
   */
  color?: string;
  /**
   * Size of the PacmanLoader
   */
  size?: number;
  /**
   * Whether to take full screen height
   */
  fullScreen?: boolean;
}

export const Loading = ({ 
  className, 
  message, 
  color = '#D1D4FD', 
  size = 25,
  fullScreen = true 
}: LoadingProps) => {
  return (
    <div 
      className={cn(
        "bg-background flex flex-col items-center justify-center",
        fullScreen ? "min-h-screen" : "h-full w-full",
        className
      )}
    >
      <PacmanLoader color={color} size={size} />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground font-body">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;
