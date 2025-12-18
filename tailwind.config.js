/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
        './src/**/*.{js,jsx}',
    ],
    prefix: "",
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
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
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
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                // Existing
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },

                // Fade animations
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-in-down": {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },

                // Slide animations
                "slide-in-right": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                "slide-in-left": {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0)" },
                },

                // Scale animations
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                "scale-up": {
                    "0%": { transform: "scale(1)" },
                    "100%": { transform: "scale(1.05)" },
                },

                // Pulse glow
                "pulse-glow": {
                    "0%, 100%": {
                        boxShadow: "0 0 20px -5px hsl(243, 75%, 59%), 0 0 40px -10px hsl(258, 90%, 66%)"
                    },
                    "50%": {
                        boxShadow: "0 0 30px 0px hsl(243, 75%, 59%), 0 0 60px -5px hsl(258, 90%, 66%)"
                    },
                },

                // Shimmer loading
                "shimmer": {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },

                // Bounce subtle
                "bounce-subtle": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-5px)" },
                },

                // Spin slow
                "spin-slow": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },

                // Wiggle
                "wiggle": {
                    "0%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(-3deg)" },
                    "75%": { transform: "rotate(3deg)" },
                },

                // Gradient shift
                "gradient-shift": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
            },
            animation: {
                // Existing
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",

                // Fade
                "fade-in": "fade-in 0.5s ease-out",
                "fade-in-up": "fade-in-up 0.6s ease-out",
                "fade-in-down": "fade-in-down 0.6s ease-out",

                // Slide
                "slide-in-right": "slide-in-right 0.4s ease-out",
                "slide-in-left": "slide-in-left 0.4s ease-out",

                // Scale
                "scale-in": "scale-in 0.3s ease-out",
                "scale-up": "scale-up 0.2s ease-out",

                // Pulse
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",

                // Shimmer
                "shimmer": "shimmer 2s linear infinite",

                // Bounce
                "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",

                // Spin
                "spin-slow": "spin-slow 3s linear infinite",

                // Wiggle
                "wiggle": "wiggle 0.5s ease-in-out",

                // Gradient
                "gradient-shift": "gradient-shift 3s ease infinite",
            },
            transitionDelay: {
                '0': '0ms',
                '100': '100ms',
                '200': '200ms',
                '300': '300ms',
                '400': '400ms',
                '500': '500ms',
            },
        },
    },
    plugins: [],
}
