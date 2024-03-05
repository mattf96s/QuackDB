import aspectRatio from "@tailwindcss/aspect-ratio"
import containerQueries from '@tailwindcss/container-queries'
import form from "@tailwindcss/forms"
import typography from '@tailwindcss/typography'
import animate from "tailwindcss-animate"
import { fontFamily } from "tailwindcss/defaultTheme"

/** @type {import("tailwindcss").Config} */
export default {
    darkMode: 'selector',

    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // custom
                'french-porcelain': 'rgb(246, 247, 249)'

            },
            borderRadius: {
                xl: `calc(var(--radius) + 4px)`,
                lg: `var(--radius)`,
                md: `calc(var(--radius) - 2px)`,
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", ...fontFamily.sans],
                mono: ["var(--font-jetbrains-mono)", ...fontFamily.mono],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                progress: {
                    "0%": { transform: "translateX(0) scaleX(0)" },
                    "40%": { transform: "translateX(0) scaleX(0.4)" },
                    "100%": { transform: "translateX(100%) scaleX(0.5)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                progress: "progress 1s infinite linear",
            },
            transformOrigin: {
                "left-right": "0% 50%",
            },
            typography: () => ({
                DEFAULT: {
                    css: {
                        color: "hsl(var(--foreground))",
                        '[class~="lead"]': {
                            color: "hsl(var(--foreground))",
                        },
                        a: {
                            color: "hsl(var(--primary))",
                        },
                        strong: {
                            color: "hsl(var(--foreground))",
                        },
                        "a strong": {
                            color: "hsl(var(--primary))",
                        },
                        "blockquote strong": {
                            color: "hsl(var(--foreground))",
                        },
                        "thead th strong": {
                            color: "hsl(var(--foreground))",
                        },
                        "ol > li::marker": {
                            color: "hsl(var(--foreground))",
                        },
                        "ul > li::marker": {
                            color: "hsl(var(--foreground))",
                        },
                        dt: {
                            color: "hsl(var(--foreground))",
                        },
                        blockquote: {
                            color: "hsl(var(--foreground))",
                        },
                        h1: {
                            color: "hsl(var(--foreground))",
                        },
                        "h1 strong": {
                            color: "hsl(var(--foreground))",
                        },
                        h2: {
                            color: "hsl(var(--foreground))",
                        },
                        "h2 strong": {
                            color: "hsl(var(--foreground))",
                        },
                        h3: {
                            color: "hsl(var(--foreground))",
                        },
                        "h3 strong": {
                            color: "hsl(var(--foreground))",
                        },
                        h4: {
                            color: "hsl(var(--foreground))",
                        },
                        "h4 strong": {
                            color: "hsl(var(--foreground))",
                        },
                        kbd: {
                            color: "hsl(var(--foreground))",
                        },
                        code: {
                            color: "hsl(var(--foreground))",
                        },
                        "a code": {
                            color: "hsl(var(--primary))",
                        },
                        "h1 code": {
                            color: "hsl(var(--foreground))",
                        },
                        "h2 code": {
                            color: "hsl(var(--foreground))",
                        },
                        "h3 code": {
                            color: "hsl(var(--foreground))",
                        },
                        "h4 code": {
                            color: "hsl(var(--foreground))",
                        },
                        "blockquote code": {
                            color: "hsl(var(--foreground))",
                        },
                        "thead th code": {
                            color: "hsl(var(--foreground))",
                        },
                        pre: {
                            color: "hsl(var(--foreground))",
                        },
                        "pre code": {
                            color: "hsl(var(--foreground))",
                        },
                        "thead th": {
                            color: "hsl(var(--foreground))",
                        },
                        figcaption: {
                            color: "hsl(var(--foreground))",
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        form,
        typography,
        animate,
        aspectRatio,
        containerQueries
    ],
}