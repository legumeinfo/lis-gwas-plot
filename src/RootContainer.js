import React, { useEffect, useState } from 'react';

import queryData from "./query/queryData.js";


import Scatterplot from './ScatterPlot';
import colors from './color.constant';
import Loading from './Loading';

export default function RootContainer({ serviceUrl, entity, config }) {
    const gwasId = entity.value;
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [graphData, setGraphData] = useState([]);
    const [minAxis, setminAxis] = useState({});

    var title = [];

    useEffect(() => {
	queryData(gwasId, serviceUrl)
	    .then(data => {
		setData(data);
	    })
            .catch(() => {
                setError("Error loading GWAS "+gwasId);
            });
    }, []);

    if (error) return (
        <div className="rootContainer error">{ error }</div>
    );
    
    // useEffect(() => {
    //     const obj = {};
    //     let minX = Number.MAX_SAFE_INTEGER,
    //         minY = Number.MAX_SAFE_INTEGER,
    //         maxX = Number.MIN_SAFE_INTEGER,
    //         maxY = Number.MIN_SAFE_INTEGER,
    //         index = 0;
    //     data.forEach(d => {
    //         const gwasIdentifier = d.primaryIdentifier;
    //         d.results.forEach(r => {
    //     	if (
    //     	    !r.marker
    //                     || !r.pValue
    //                     || !r.marker.chromosome
    //                     || !r.marker.chromosomeLocation
    //     	)
    //     	    return;
    //     	const { primaryIdentifier } = r.phenotype;
    //     	const { chromosome, chromosomeLocation } = r.marker;
    //     	if (!obj[primaryIdentifier])
    //     	    obj[primaryIdentifier] = {
    //     		id: primaryIdentifier,
    //     		data: [],
    //     		color: colors[index++]
    //     	    };
    //     	const allDigits = chromosome.secondaryIdentifier.match(/\d+/g) || [];
    //     	const xAxisVal = allDigits.length
    //     	      ? allDigits[allDigits.length - 1] * 1
    //     	      : 0;
    //     	const x = xAxisVal + chromosomeLocation.start / chromosome.length;
    //     	const y = -1 * Math.log10(r.pValue);
    //             minX = Math.min(x, minX);
    //     	minY = Math.min(y, minY);
    //     	maxX = Math.max(x, maxX);
    //     	maxY = Math.max(y, maxY);
    //             const markerLocation = '[' + gwasIdentifier + "] " + r.marker.secondaryIdentifier + ' @ ' + r.marker.chromosome.secondaryIdentifier + ':' + r.marker.chromosomeLocation.start;
    //     	obj[primaryIdentifier].data.push({
    //     	    x,
    //     	    y,
    //     	    tooltip: markerLocation
    //     	});
    //         });
    //     });
    //     setGraphData([...Object.values(obj)]);
    //     setminAxis({ minX, minY, maxX, maxY });
    // }, [data]);

    return (
	    <div className="rootContainer">
                {data ? (
                    <div>{ JSON.stringify(data) }</div>
                ) : (
		    <Loading />
                )}
	    </div>
    );
};


		//     <div className="graph">
		//     {graphData.length ? (
		// 	    <Scatterplot graphData={graphData} minAxis={minAxis} />
		//     ) : (
		// 	    <h1>No data found to visualize</h1>
		//     )}
		// </div>
