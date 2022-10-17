import React from 'react';
import { useState, useEffect } from 'react';
import Loader from './common/loader';
import CanvasXpressReact from 'canvasxpress-react';

import queryGWASResults from "./queryGWASResults.js";
import queryGenomes from "./queryGenomes.js";
import queryChromosomes from "./queryChromosomes.js";
import getChartData from "./getChartData.js";

export default function RootContainer({ serviceUrl, entity, config }) {
    const gwasId = entity.value;
    const [error, setError] = useState(null);
    const [genomes, setGenomes] = useState(null);
    const [plotData, setPlotData] = useState(null);

    // TIP: useEffect with empty array dependency only runs once!
    useEffect(() => {
        // genomes via markers
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
                                prefix: prefix,
                                abbreviation: marker.organism.abbreviation,
                                strain: marker.strain.identifier,
                                assemblyVersion: marker.assemblyVersion
                            });
                        }
                    })
                })
                setGenomes(genomes);
            })
            .catch(() => {
                setError("Genome data not found via markers for id="+gwasId);
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
        "subtitle": "Slide window with mouse; change scale with mouse wheel over axis; resize plot by dragging edges; select region to zoom in; click marker to see its page.",
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
            // chromosome lengths
            queryChromosomes(genomes[i], serviceUrl)
                .then(chromosomes => {
                    var chromosomeLengths = [];
                    chromosomes.map((chromosome) => {
                        chromosomeLengths.push(chromosome.length);
                    });
                    conf.chromosomeLengths = chromosomeLengths;
                    conf.title = genomes[i];
                })
                .catch(() => {
                    setError("Error getting chromosomes.");
                });
            // GWASResults (markers on the given chromosomes)
            const vars = [];
            const data = [];
            const traits = [];
            queryGWASResults(gwasId, genomes[i], serviceUrl)
                .then(response => {
                    response.forEach(result => {
                        // chromosomes have to be numbers for plot
                        const len = result.markers[0].chromosome.name.length;
                        const lastTwo = result.markers[0].chromosome.name.substring(len-2,len);
                        const lastOne = result.markers[0].chromosome.name.substring(len-1,len);
                        var num = parseInt(lastTwo);
                        if (isNaN(num)) {
                            num = parseInt(lastOne);
                        }
                        if (isNaN(num)) {
                            num = 0;
                        }
                        const mlog10p = -Math.log10(result.pValue);
                        const datoid = [num, result.markers[0].chromosomeLocation.start, mlog10p];
                        vars.push(result.markers[0].name);
                        data.push(datoid);
                        traits.push(result.trait.name);
                    });
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
                })                    
                .catch(() => {
                    setError("GWASResults not found for GWAS id="+gwasId);
                });
        }
    }

    if (error) return (
            <div className="rootContainer error">{ error }</div>
    );

    // add events={evts} 
    // var evts = {
    //     "click": function(o, e, t) {
    //         var markerName = o.y.vars[0];
    //     }
    // }
    
    return (
        <div className="rootContainer">
            {genomes && (
                <div className="selector">
                    <select name="genomeIndex" onChange={handleChange}>
                        <option key={-1} value={-1}>--- SELECT GENOME FOR MARKERS ---</option>
                        {genomes.map((genome,i) => (
                            <option key={i} value={i}>{genome.prefix}</option>
                        ))}
                    </select>
                </div>
            )}
            {conf && plotData && (
                <CanvasXpressReact target={"canvas"} data={plotData} config={conf} width={1000} height={500} />
            )}
            {!genomes && !plotData && (
                <Loader />
            )}
        </div>
    );

}
