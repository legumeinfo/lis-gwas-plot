import React from 'react';
import Loader from './common/loader';
import { useState, useEffect } from 'react';

import queryData from "./query/queryData.js";
import getChartData from "./chart/getChartData.js";
import getChromosomes from "./chart/getChromosomes.js";

import { GWASBarchart } from "./components/GWASBarchart.js";

export default function RootContainer({ serviceUrl, entity, config }) {
    const gwasId = entity.value;
    const [error, setError] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [chromosomes, setChromosomes] = useState(null);

    // TIP: useEffect with empty array dependency only runs once!
    useEffect(() => {
        queryData(gwasId, serviceUrl)
            .then(response => {
                setChromosomes(getChromosomes(response));
                setChartData(getChartData(response));
            })
            .catch(() => {
                setError("GWAS data not found for id="+gwasId);
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

    return (
        <div className="rootContainer">
            {chartData ? (
                chartData.map((data,index) =>
                    <GWASBarchart data={data} chromosome={chromosomes[index]} />
                )
            ) : (
		<Loader />
            )}
	</div>
    );
}




                // chromosomes.map((chromosome,index) =>
                // )
