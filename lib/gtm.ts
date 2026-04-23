export type GtmSection =
  | "academy"
  | "studio"
  | "rentals"
  | "kids"
  | "homepage"
  | "blog"
  | "jobs"
  | "about"
  | "contact"
  | "auth"
  | "dashboard";

export type GtmPromotionType =
  | "banner"
  | "card"
  | "text-link"
  | "carousel"
  | "navbar"
  | "footer";

export interface CrossPromotionClickParams {
  from_section?: GtmSection;
  to_section: GtmSection;
  promotion_type: GtmPromotionType;
  clicked_item: string;
}

/**
 * Utility to determine the section based on a path.
 */
export const getSectionFromPath = (path: string): GtmSection => {
  if (path === "/" || path === "") return "homepage";
  if (path.startsWith("/academy/rentals")) return "rentals";
  if (path.startsWith("/academy")) return "academy";
  if (path.startsWith("/studio")) return "studio";
  if (path.startsWith("/kids")) return "kids";
  if (path.startsWith("/blog")) return "blog";
  if (path.startsWith("/jobs")) return "jobs";
  if (path.startsWith("/about")) return "about";
  if (path.startsWith("/contact")) return "contact";
  if (path.startsWith("/auth")) return "auth";
  if (
    path.startsWith("/user/dashboard") ||
    path.startsWith("/admin/dashboard")
  )
    return "dashboard";
  return "homepage";
};

/**
 * Pushes a cross_promotion_click event to the GTM dataLayer.
 */
export const pushCrossPromotionClick = ({
  from_section,
  to_section,
  promotion_type,
  clicked_item,
}: CrossPromotionClickParams) => {
  if (typeof window !== "undefined") {
    // Determine current section if not provided
    const currentFromSection =
      from_section || getSectionFromPath(window.location.pathname);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "cross_promotion_click",
      from_section: currentFromSection,
      to_section,
      promotion_type,
      clicked_item,
      page: window.location.pathname,
    });

    // Optional: Log in development
    if (process.env.NODE_ENV === "development") {
      console.log("GTM Cross Promotion Click:", {
        from_section: currentFromSection,
        to_section,
        promotion_type,
        clicked_item,
        page: window.location.pathname,
      });
    }
  }
};
