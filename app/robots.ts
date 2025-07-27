import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/trainer/", "/client/", "/debug/"],
    },
    sitemap: "https://www.coachkilday.com/sitemap.xml",
  };
}
