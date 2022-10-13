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
    const [chartData, setChartData] = useState(null);
    const [chromosomes, setChromosomes] = useState(null);
    const [chromosomeLengths, setChromosomeLengths] = useState([]);
    const [prefix, setPrefix] = useState(null);
    const [genomeLength, setGenomeLength] = useState(0);

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
                        var chromosomeLengths = [];
                        chromosomes.map((chromosome) => {
                            genomeLength += chromosome.length;
                            chromosomeLengths.push(chromosome.length);
                        });
                        setGenomeLength(genomeLength);
                        setChromosomeLengths(chromosomeLengths);
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
        "dataPointSize": 50,
        "legendBox": false,
        "legendScaleFontFactor": 2,
        "legendTitleScaleFontFactor": 3,
        "legendInside": false,
        "legendPositionAuto": false,
        "legendPosition": "right",
    }

    // can we do events?
    var evts = {
        "click": function(o, e, t) {
            var markerName = o.y.vars[0];
            var markerIdentifier = prefix+"."+markerName;
            window.open("/"+"${WEB_PROPERTIES['webapp.path']}"+"/geneticmarker:"+markerIdentifier);
        }
    }
    
    // update genome-specific conf attributes
    // conf["chromosomeLengths"] = chromosomeLengths;
    // conf["title"] = prefix;

    conf["title"] = "FAKE DATA";
    conf["chromosomeLengths"] = [100000,200000,300000,400000];
    
    // set the plot data
    var data = {
        // z: {
        //     "Trait": genomeData["traits"]
        // },
        // y: {
        //     "smps": ["Chr","Pos","-log10(p)"],
        //     "vars": genomeData["vars"],
        //     "data": genomeData["data"]
        // }
    }

    // const canvasConfig = {
    //     "graphOrientation": "vertical",
    //     "graphType": "Dotplot",
    //     "theme": "CanvasXpress",
    //     "title": "Simple Bar graph"
    // };
    const testData =  {
        "y" : {
            "vars" : ["Variable1"],
        "smps" : ["Sample1", "Sample2", "Sample3"],
            "data" : [[33, 48, 55]]
        }
    };

    return (
        <div className="rootContainer">
            {(chromosomes && chartData) ? (
                <CanvasXpressReact target={"canvas"} data={testData} config={conf} width={500} height={500} />
            ) : (
		<Loader />
            )}
	</div>
    );
}
