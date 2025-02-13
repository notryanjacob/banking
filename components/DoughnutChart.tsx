"use client"

import React from 'react'
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js'
Chart.register(ArcElement, Tooltip);

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
    const data = {
        datasets: [
            {
                label: "Banks",
                data: [1250, 1500, 3000],
                backgroundColor: ['#0747b6', '#2265d8', '#2f91f8']
            }
        ],
        labels: ['Bank 1', 'Bank 2', 'Bank 3']
    }
    const options = {
        cutout: '60%',
        plugins: {
            tooltip: {
                enabled: true,
            },
        },
    };
    return (
        <Doughnut data={data} options={options} />
    );
}

export default DoughnutChart
