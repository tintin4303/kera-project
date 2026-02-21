import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "KERA",
        short_name: "KERA",
        description: "Connect families abroad to trusted carers in Myanmar.",
        start_url: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#004225",
        icons: [
            {
                src: "/pwa-icon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
        ],
    };
}
