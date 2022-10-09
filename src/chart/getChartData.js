const COLORS = [ '#900', '#090', '#009', '#990', '#909', '#099', '#360', '#306', '#036', '#000' ];


/**
 * Create ChartJS data from queryData results.
 */
export default function getChartData(results) {

    // results: [
    //     {
    //         "objectId": 73000003,
    //         "class": "GWASResult",
    //         "markers": [
    //             {
    //                 "objectId": 47000099,
    //                 "class": "GeneticMarker",
    //                 "name": "S5_38322754",
    //                 "chromosome": {
    //                     "objectId": 46000010,
    //                     "class": "Chromosome",
    //                     "name": "Chr05"
    //                 },
    //                 "chromosomeLocation": {
    //                     "objectId": 47000100,
    //                     "class": "Location",
    //                     "end": 38322754,
    //                     "start": 38322754
    //                 }
    //             }
    //         ],
    //         "pValue": 2.82e-10,
    //         "gwas": {
    //             "objectId": 73000002,
    //             "class": "GWAS",
    //             "primaryIdentifier": "mixed.gwas.DiVittori_Bitocchi_2021"
    //         }
    //     },
    //     ...
    // ]


    // const data = {
    //     datasets: [
    //         {
    //             barThickness: 2,
    //             source: results[0].gwas.primaryIdentifier,
    //             indexAxis: 'x',
    //             backgroundColor: 'gray',
    //             borderWidth: 0,
    //             data: []
    //         },
    //         {
    //             barThickness: 2,
    //             source: results[0].gwas.primaryIdentifier,
    //             indexAxis: 'x',
    //             backgroundColor: 'gray',
    //             borderWidth: 0,
    //             data: []
    //         },
    //     ]
    // }

    // color per dataset
    
    // each chromosome is in its own data object with a single dataset
    const dataArray = [];

    // initialize the chart.js data object with a single dataset.
    // const data = {
    //     labels: [],
    //     datasets: []
    // };

    const chromosomes = [];
    var data = null;
    var dataset = null;
    var index = -1;
    results.forEach(result => {
        const value = -Math.log10(result.pValue);
        result.markers.forEach(marker => {
            const chromosome = marker.chromosome.primaryIdentifier;
            const start = marker.chromosomeLocation.start;
            if (!chromosomes.includes(chromosome)) {
                // push old data
                if (data) {
                    dataArray.push(data);
                }
                // create new data object
                index++;
                chromosomes.push(chromosome);
                // color per chromosome for now
                var color = 'black';
                if (index<COLORS.length) {
                    color = COLORS[index];
                }
                dataset = {
                    label: chromosome,
                    barThickness: 2,
                    indexAxis: 'x',
                    backgroundColor: color,
                    borderWidth: 0,
                    data: []
                }
                data = {
                    datasets: [ dataset ]
                }
            }
            // push this result onto the dataset.data
            dataset.data.push({ x:start, y:value });
        });
    });
    // last chromosome
    dataArray.push(data);

    return dataArray;
}
