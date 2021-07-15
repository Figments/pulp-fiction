require('dotenv').config();

module.exports = {
    mode: 'jit',
    purge: {
        enabled: process.env.NODE_ENV === 'production',
        content: [
            './apps/bettafish/src/**/*.{html,ts}',
            './libs/client/editor/src/lib/**/*.{html,ts}',
            './libs/client/ui/src/lib/**/*.{html,ts}',
            './libs/client/my-stuff/src/lib/**/*.{html,ts}',
            './libs/client/dashboard/src/lib/**/*.{html,ts}',
            './libs/client/alerts/src/lib/**/*.{html,ts}',
            './libs/client/comments/src/lib/**/*.{html,ts}',
            './libs/client/editor-lite/src/lib/**/*.{html,ts}',
        ],
    },
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/aspect-ratio'),
        require('@tailwindcss/forms'),
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/typography'),
    ],
};
