// frontend/src/components/SalesChart.jsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler, // 1. Import the Filler plugin
} from 'chart.js';

// 2. Register the Filler plugin
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SalesChart = ({ orders }) => {
    const salesData = orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        let orderTotalForSeller = 0;
        if (order.items) {
            orderTotalForSeller = order.items.reduce((itemTotal, item) => itemTotal + (item.price * item.quantity), 0)
        }
        acc[date] = (acc[date] || 0) + orderTotalForSeller;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(salesData).reverse(),
        datasets: [
            {
                label: 'Daily Revenue',
                data: Object.values(salesData).reverse(),
                fill: true, // This option requires the Filler plugin
                backgroundColor: 'rgba(100, 108, 255, 0.2)',
                borderColor: '#646cff',
                tension: 0.3,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Recent Sales Revenue',
                color: '#e0e0e0',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#a0a0a0' },
                grid: { color: '#333' }
            },
            x: {
                ticks: { color: '#a0a0a0' },
                grid: { color: '#333' }
            }
        }
    };

    return <Line options={options} data={chartData} />;
};

export default SalesChart;