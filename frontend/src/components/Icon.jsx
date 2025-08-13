// src/components/Icon.jsx
import React from 'react';

// Зберігаємо шляхи до SVG в одному місці
const icons = {
    arrowDown: <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />,
    cart: <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-1.45-5c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.67-.11-1.48-.88-1.48H5.21l-.94-2H1v2h2l3.6 7.59L3.62 17H19v-2H7l1.1-2h7.45z" />,
    search: <path d="m848-240-192-192q-33 24-74.5 37.5T480-480q-92 0-158-66T256-704q0-92 66-158t158-66q92 0 158 66t66 158q0 42-13.5 83.5T752-528l192 192-56 56ZM480-528q-73 0-124.5-51.5T304-704q0-73 51.5-124.5T480-880q73 0 124.5 51.5T656-704q0-73-51.5 124.5T480-528Z" />
};

const Icon = ({ name, size = 24, className = '' }) => {
    if (!icons[name]) {
        return null; // Або іконка за замовчуванням
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height={`${size}px`}
            viewBox="0 -960 960 960"
            width={`${size}px`}
            fill="currentColor" // Дуже важливо! Іконка успадковує колір тексту.
            className={className}
        >
            {icons[name]}
        </svg>
    );
};

export default Icon;