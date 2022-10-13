import React from 'react';
import Loader from './common/loader';
import {
    BarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    BarElement,
    PointElement,
    Tooltip,
} from 'chart.js';

import { useState, useEffect } from 'react';
import { ReactChart } from 'chartjs-react';

import queryGWASResults from "./queryGWASResults.js";
import queryGenomes from "./queryGenomes.js";
import queryChromosomes from "./queryChromosomes.js";

import getChartData from "./getChartData.js";

// Register all of your imported stuff!
ReactChart.register(BarController, ScatterController, CategoryScale, LinearScale, LogarithmicScale, BarElement, PointElement, Tooltip);

export default function RootContainer({ serviceUrl, entity, config }) {
    const gwasId = entity.value;
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [chromosomes, setChromosomes] = useState(null);
    const [prefix, setPrefix] = useState(null);
    const [genomeLength, setGenomeLength] = useState(0);

    // TIP: useEffect with empty array dependency only runs once!
    useEffect(() => {
        // genomes via markers
        const genomes = [];
        queryGenomes(gwasId, serviceUrl)
            .then(response => {
                const genomes = [];
                const prefixes = [];
                response.forEach(item => {
                    item.markers.forEach(marker => {
                        const prefix = marker.organism.abbreviation + "." + marker.strain.identifier + "." + marker.assemblyVersion;
                        if (!prefixes.includes(prefix)) {
                            prefixes.push(prefix);
                            genomes.push({
                                abbreviation: marker.organism.abbreviation,
                                strain: marker.strain.identifier,
                                assemblyVersion: marker.assemblyVersion
                            });
                        }
                    });
                });
                // TODO: JUST FIRST GENOME FOR NOW
                // assembly prefix
                const prefix = genomes[0].abbreviation + "." + genomes[0].strain + "." + genomes[0].assemblyVersion;
                setPrefix(prefix);
                // chromosomes
                queryChromosomes(genomes[0], serviceUrl)
                    .then(chromosomes => {
                        setChromosomes(chromosomes);
                        // get total genome length for axis sizing
                        var genomeLength = 0;
                        chromosomes.map((chromosome) => {
                            genomeLength += chromosome.length;
                        });
                        setGenomeLength(genomeLength);
                        // GWASResults (markers on the given chromosomes)
                        queryGWASResults(gwasId, serviceUrl)
                            .then(response => {
                                setChartData(getChartData(response, chromosomes, prefix));
                            })
                            .catch(() => {
                                setError("GWASResults not found for id="+gwasId);
                            });
                    })
                    .catch(() => {
                        setError("Error getting chromosomes.");
                    });
            })
            .catch(() => {
                setError("Genome data not found via markers for id="+gwasId);
            });
    }, []);
    
    if (error) return (
            <div className="rootContainer error">{ error }</div>
    );

    // if (chartData) {
    //     alert(JSON.stringify(chartData));
    // }
    // if (chromosomes) {
    //     alert(JSON.stringify(chromosomes));
    // }

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
                // stacked: true,
                suggestedMin: 0,
                suggestedMax: 10,
            },
            x: {
                axis: 'x',
                position: 'bottom',
                title: {
                    text: "Marker Position",
                    display: true,
                },
                ticks: {
                    autoSkip: false,
                },
                type: 'linear',
                // stacked: true,
                min: 0,
                suggestedMax: genomeLength,
            },
        },
	maintainAspectRatio: false,
	responsive: true,
        plugins: {
            // tooltip: {
            //     callbacks: {
            //         label: function(context) {
            //             // let label = context.parsed.x + ":" + context.parsed.y
            //             let label = JSON.stringify(context.parsed);
            //             return label;
            //         }
            //     }
            // },
            // legend: {
            //     display: true,
            //     labels: {
            //         color: 'rgb(255, 99, 132)'
            //     },
            // },
            title: {
                display: true,
                text: prefix,
            },
        }
    };

    return (
        <div className="rootContainer">
            {(chromosomes && chartData) ? (
                <ReactChart
                    id="gwas-bar-chart"
                    type="scatter"
                    data={chartData}
                    options={options}
                />
            ) : (
		<Loader />
            )}
	</div>
    );
}
