/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Alyra Primary Gradient Colors (Purple Dominant)
                primary: {
                    DEFAULT: "#6D28FF",
                    light: "#8B5CF6",
                    dark: "#C026FF",
                    accent: "#E879F9"
                },
                // Alyra Background Gradient (Deep Purple Futuristic)
                background: {
                    DEFAULT: "#020005", // Deep Black-Purple
                    mid: "#040010",     // Dark Navy-Black
                    light: "#0B001A",   // Darkest Purple
                },
                // Alyra Text Colors (High Contrast)
                text: {
                    primary: "#FFFFFF",
                    secondary: "#A1A1AA", // Alyra Gray
                    muted: "#B8C0FF",    // Lavender/Blue
                },
                // Legacy support
                secondary: "#C026FF",
                accent: "#E879F9",
                'secondary-purple': "#C026FF",
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                'inter-tight': ['"Inter Tight"', 'sans-serif'],
                poppins: ['Space Grotesk', 'Poppins', 'sans-serif'],
                space: ['Space Grotesk', 'sans-serif'],
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            backdropBlur: {
                glass: '12px',
            },
            boxShadow: {
                'soft': '0 8px 30px rgba(0, 0, 0, 0.05)',
                'glow-purple': '0 0 20px rgba(192, 38, 255, 0.35)',
                'glow-pink': '0 0 20px rgba(232, 121, 249, 0.25)',
                'glow-gradient': '0 0 20px rgba(192, 38, 255, 0.45)',
            },
            backgroundImage: {
                'alyra-gradient': 'linear-gradient(135deg, #6D28FF 0%, #8B5CF6 25%, #C026FF 50%, #E879F9 100%)',
                'alyra-dark': 'linear-gradient(135deg, #020005 0%, #040010 50%, #0B001A 100%)',
            }
        },
    },
    plugins: [],
}
