import React, { useEffect, useState } from 'react';
import { queryData } from './query';
import Scatterplot from './ScatterPlot';
import colors from './color.constant';
import Loading from './Loading';

const RootContainer = ({ serviceUrl, entity }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [minAxis, setminAxis] = useState({});

    var title = [];

    useEffect(() => {
	setLoading(true);
	let { value } = entity;
	queryData({
	    serviceUrl: serviceUrl,
	    gwasId: !Array.isArray(value) ? [value] : value
	})
	    .then(data => {
		setData(data);
		setLoading(false);
	    })
	    .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
	const obj = {};
	let minX = Number.MAX_SAFE_INTEGER,
	    minY = Number.MAX_SAFE_INTEGER,
	    maxX = Number.MIN_SAFE_INTEGER,
	    maxY = Number.MIN_SAFE_INTEGER,
	    index = 0;
	data.forEach(d => {
            const gwasIdentifier = d.primaryIdentifier;
	    d.results.forEach(r => {
		if (
		    !r.marker
                        || !r.pValue
                        || !r.marker.chromosome
                        || !r.marker.chromosomeLocation
		)
		    return;
		const { primaryIdentifier } = r.phenotype;
		const { chromosome, chromosomeLocation } = r.marker;
		if (!obj[primaryIdentifier])
		    obj[primaryIdentifier] = {
			id: primaryIdentifier,
			data: [],
			color: colors[index++]
		    };
		const allDigits = chromosome.secondaryIdentifier.match(/\d+/g) || [];
		const xAxisVal = allDigits.length
		      ? allDigits[allDigits.length - 1] * 1
		      : 0;
		const x = xAxisVal + chromosomeLocation.start / chromosome.length;
		const y = -1 * Math.log10(r.pValue);
                minX = Math.min(x, minX);
		minY = Math.min(y, minY);
		maxX = Math.max(x, maxX);
		maxY = Math.max(y, maxY);
                const markerLocation = '[' + gwasIdentifier + "] " + r.marker.secondaryIdentifier + ' @ ' + r.marker.chromosome.secondaryIdentifier + ':' + r.marker.chromosomeLocation.start;
		obj[primaryIdentifier].data.push({
		    x,
		    y,
		    tooltip: markerLocation
		});
	    });
	});
	setGraphData([...Object.values(obj)]);
	setminAxis({ minX, minY, maxX, maxY });
    }, [data]);

    return (
	    <div className="rootContainer">
	    {!loading ? (
		    <div className="graph">
		    {graphData.length ? (
			    <Scatterplot graphData={graphData} minAxis={minAxis} />
		    ) : (
			    <h1>No data found to visualize</h1>
		    )}
		</div>
	    ) : (
		    <Loading />
	    )}
	</div>
    );
};

export default RootContainer;
