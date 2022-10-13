const BACKGROUND_COLORS = [ '#900', '#090', '#009', '#990', '#909', '#099', '#360', '#306', '#036', '#000' ];

/**
 * Create ChartJS data from queryData results.
 */
export default function getChartData(results, chromosomes, prefix) {
    // initialize the chart.js data object with a single dataset.
    const data = {
        labels: [],
        datasets: [{
            label: prefix,
            barThickness: 2,
            indexAxis: 'x',
            borderWidth: 0,
            data: [],
            backgroundColor: [],
        }]
    };

    // form a map of chromosome identifiers to x-axis offset
    var offsets = new Map();
    var colors = new Map();
    var offset = 0;
    var index = 0;
    chromosomes.map((chromosome) => {
        offsets.set(chromosome.primaryIdentifier, offset);
        colors.set(chromosome.primaryIdentifier, BACKGROUND_COLORS[index]);
        offset += chromosome.length;
        index++;
    });

    // black bars at chromosome offsets
    // for (const [key, value] of offsets) {
    //     data.datasets[0].data.push({ x:value, y:10.0 });
    //     data.datasets[0].backgroundColor.push('black');
    // }

    // iterate through markers per result
    results.forEach(result => {
        const value = -Math.log10(result.pValue);
        result.markers.forEach(marker => {
            if (offsets.has(marker.chromosome.primaryIdentifier)) {
                const x = marker.chromosomeLocation.start + offsets.get(marker.chromosome.primaryIdentifier);
                const backgroundColor = colors.get(marker.chromosome.primaryIdentifier);
                // push this result onto the dataset.data
                data.datasets[0].data.push({ x:x, y:value });
                data.datasets[0].backgroundColor.push(backgroundColor);
            }
        });
    });
    
    return data;
}
