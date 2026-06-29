import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "个人投资 AI Matrix",
    short_name: "AI Matrix",
    description: "移动端优先的个人投资管理与辅助判断工具",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f2",
    theme_color: "#18211f",
    orientation: "portrait",
  };
}
