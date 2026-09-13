import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "full" | "icon";
  className?: string;
  imageClassName?: string;
  href?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  className,
  imageClassName,
  href = "/",
}) => {
  const content = (
    <div className={cn("inline-flex items-center gap-2 select-none", className)}>
      {variant === "full" ? (
        <div className={cn("relative h-9 w-40", imageClassName)}>
          <Image
            src="/assets/logo_with_name.png"
            alt="HackSphere"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      ) : (
        <div className={cn("relative h-9 w-9", imageClassName)}>
          <Image
            src="/assets/logo.png"
            alt="HackSphere"
            fill
            className="object-contain"
            priority
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
