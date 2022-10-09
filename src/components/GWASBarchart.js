import { ReactChart } from 'chartjs-react';
import {
    BarController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    Tooltip,
} from 'chart.js';

// Register all of your imported stuff!
ReactChart.register(BarController, CategoryScale, LinearScale, LogarithmicScale, BarElement, Tooltip);

export function GWASBarchart({ data, chromosome }) {
    if (!data) return;

    // default chart options
    const options = {
        scales: {
            y: {
                axis: 'y',
                position: 'left', // `axis` is determined by the position as `'y'`,
                title: {
                    text: '-log10(p)',
                    display: true,
                },
                ticks: {
                    autoSkip: false,
                },
                type: 'linear',
                stacked: true,
                suggestedMin: 0,
                suggestedMax: 10,
            },
            x: {
                axis: 'x',
                position: 'bottom',
                title: {
                    text: chromosome.identifier,
                    display: true,
                },
                ticks: {
                    autoSkip: false,
                },
                type: 'linear',
                stacked: true,
                suggestedMin: 1,
                suggestedMax: chromosome.length,
            },
        },
	maintainAspectRatio: false,
	responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        // let label = context.parsed.x + ":" + context.parsed.y
                        let label = JSON.stringify(context.parsed);
                        return label;
                    }
                }
            },
            legend: {
                display: true,
                labels: {
                    color: 'rgb(255, 99, 132)'
                },
            },
        }
    };

    return (
        <ReactChart
            id="gwas-bar-chart"
            type="bar"
            data={data}
            options={options}
        />
    );
}
