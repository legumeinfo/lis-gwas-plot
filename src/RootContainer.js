import React from 'react';
import { useState, useEffect } from 'react';
import Loader from './common/loader';
import CanvasXpressReact from 'canvasxpress-react';

import queryGWAS from "./queryGWAS.js";
import queryChromosomes from "./queryChromosomes.js";

export default function RootContainer({ serviceUrl, entity, config }) {
    const gwasId = entity.value;
    const [error, setError] = useState(null);
    const [prefixes, setPrefixes] = useState(null);
    const [gwasResponse, setGwasResponse] = useState(null);
    const [plotData, setPlotData] = useState(null);
    const [markerIdMap, setMarkerIdMap] = useState(null);

    // TIP: useEffect with empty array dependency only runs once!
    useEffect(() => {
        // query GWAS results including markers mapped to multiple assemblies: extract distinct genome assemblies.
        queryGWAS(gwasId, serviceUrl)
            .then(response => {
                const prefixes = [];
                response.forEach(result => {
                    result.markers.forEach(marker => {
                        const prefix = marker.organism.abbreviation + "." + marker.strain.identifier + "." + marker.assemblyVersion;
                        if (!prefixes.includes(prefix)) {
                            prefixes.push(prefix);
                        }
                    });
                });
                setGwasResponse(response);
                setPrefixes(prefixes);
            })
            .catch(() => {
                setError("GWAS data not found for id="+gwasId);
            });
    }, []);
    
    // static canvasXpress config
    const conf = {
        "decorations": {
            "line": [
                { "color": "rgb(0,0,255)", "width": 1, "y": 1.3 }
            ]
        },
        "graphType": "Scatter2D",
        "manhattanMarkerChromosomeNumber": "Chr",
        "manhattanMarkerLogPValue": "-log10(p)",
        "manhattanMarkerPosition": "Pos",
        "scatterType": "manhattan",
        "titleScaleFontFactor": 0.3,
        "subtitleScaleFontFactor": 0.2,
        "axisTitleScaleFontFactor": 2.0,
        "disableToolbar": true,
        "colorBy": "Trait",
        "colorByShowLegend": true,
        "canvasBox": true,
        "setMinY": 0.0,
        "dataPointSize": 35,
        "legendBox": false,
        "legendScaleFontFactor": 2,
        "legendTitleScaleFontFactor": 3,
        "legendInside": false,
        "legendPositionAuto": false,
        "legendPosition": "right",
    }

    // on selector change set the genome and get its data
    function handleChange(event) {
        var i = event.target.value;
        if (i < 0) {
            setPlotData(null);
        } else {
            conf.title = prefixes[i];
            conf.chromosomeLengths = []; 
            // get all chromosome lengths
            queryChromosomes(prefixes[i], serviceUrl)
                .then(chromosomes => { 
                    chromosomes.map((chromosome) => {
                        conf.chromosomeLengths.push(chromosome.length);
                    });
                })
                .catch(() => {
                    setError("Error getting chromosomes.");
                });
            // GWAS results for the chosen genome prefix
            const vars = [];
            const data = [];
            const traits = [];
            const markerIdMap = new Map();
            gwasResponse.forEach(result => {
                result.markers.forEach(marker => {
                    const prefix = marker.organism.abbreviation + "." + marker.strain.identifier + "." + marker.assemblyVersion;
                    if (prefix == prefixes[i]) {
                        // chromosomes have to be numbers for plot
                        const len = marker.chromosome.name.length;
                        const lastTwo = marker.chromosome.name.substring(len-2,len);
                        const lastOne = marker.chromosome.name.substring(len-1,len);
                        var num = parseInt(lastTwo);
                        if (isNaN(num)) {
                            num = parseInt(lastOne);
                        }
                        if (isNaN(num)) {
                            num = 0;
                        }
                        // use middle between marker start and end
                        const position = (marker.chromosomeLocation.start + marker.chromosomeLocation.end)/2;
                        // plot -log10(p)
                        const mlog10p = -Math.log10(result.pValue);
                        // canvasXpress
                        const datoid = [num, position, mlog10p];
                        vars.push(marker.primaryIdentifier);
                        data.push(datoid);
                        traits.push(result.trait.name);
                        // keep track of marker IDs for linkout
                        markerIdMap.set(marker.primaryIdentifier, marker.objectId);
                    }
                });
                setMarkerIdMap(markerIdMap);
                // canvasXpress plot data
                const plotData = {
                    z: {
                        "Trait": traits
                    },
                    y: {
                        "smps": ["Chr","Pos","-log10(p)"],
                        "vars": vars,
                        "data": data
                    }
                }
                setPlotData(plotData);
            });
        }
    }

    if (error) return (
            <div className="rootContainer error">{ error }</div>
    );

    // marker click opens a new GeneticMarker page
    // window.location.href: http://domain.org/beanmine/report/GWAS/29000003
    // marker page:          http://domain.org/beanmine/report/GeneticMarker/75000002
    var evts = {
        "click": function(o, e, t) {
            var markerIdentifier = o.y.vars[0];
            const uriParts = window.location.href.split("GWAS");
            window.open(uriParts[0]+"GeneticMarker/"+markerIdMap.get(markerIdentifier));
        }
    }
    
    return (
        <div>
            {prefixes && (
                <div className="selector">
                    <select name="genomeIndex" onChange={handleChange}>
                        <option key={-1} value={-1}>--- SELECT GENOME FOR MARKERS ---</option>
                        {prefixes.map((prefix,i) => (
                            <option key={i} value={i}>{prefix}</option>
                        ))}
                    </select>
                </div>
            )}
            {conf && plotData && (
                <div className="rootContainer">
                    <i>Slide window with mouse; change scale with mouse wheel over axis; resize plot by dragging edges; select region to zoom in; click marker to see its page.</i>
                    <CanvasXpressReact target={"canvas"} data={plotData} config={conf} height={500} width={1150} events={evts} />
                </div>
            )}
            {!prefixes && !plotData && (
                <Loader />
            )}
        </div>
    );

}
