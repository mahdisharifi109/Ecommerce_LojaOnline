import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index);
    }
  };

  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(maxRating)].map((_, i) => {
        const index = i + 1;
        const isFilled = (hoverRating !== null ? hoverRating : rating) >= index;
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              "transition-all duration-200 focus:outline-none",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            disabled={readonly}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-200",
                isFilled
                  ? "fill-[#F59E0B] text-[#F59E0B]" // Gold filled
                  : "fill-transparent text-gray-200" // Gray empty
              )}
              strokeWidth={isFilled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

interface RatingSummaryProps {
  average: number;
  totalReviews: number;
  distribution?: { [key: number]: number }; // e.g., { 5: 10, 4: 5, ... }
}

export function RatingSummary({ average, totalReviews, distribution }: RatingSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-foreground">{average.toFixed(1)}</div>
        <div className="space-y-1">
          <StarRating rating={Math.round(average)} readonly size="md" />
          <p className="text-sm text-muted-foreground">{totalReviews} avaliações</p>
        </div>
      </div>
      
      {distribution && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 w-12">
                  <span className="font-medium">{star}</span>
                  <Star className="w-3 h-3 fill-foreground text-foreground" />
                </div>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F59E0B] rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-8 text-right text-muted-foreground text-xs">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}