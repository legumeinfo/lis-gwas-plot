/**
 * Get a list of distinct chromosomes in this GWAS.
 */
export default function getChromosomes(results) {
    const chromosomeIdentifiers = [];
    const chromosomes = [];
    results.forEach(result => {
        result.markers.forEach(marker => {
            // {
            //     "objectId": 46446888,
            //     "class": "GeneticMarker",
            //     "name": "S01_24248170",
            //     "chromosome": {
            //         "objectId": 46000007,
            //         "class": "Chromosome",
            //         "primaryIdentifier": "phavu.G19833.gnm2.Chr01",
            //         "name": "Chr01",
            //         "length": 12345678
            //     },
            //     "chromosomeLocation": {
            //         "objectId": 46446889,
            //         "class": "Location",
            //         "end": 24248170,
            //         "start": 24248170
            //     }
            // }
            if (!chromosomeIdentifiers.includes(marker.chromosome.primaryIdentifier)) {
                chromosomeIdentifiers.push(marker.chromosome.primaryIdentifier);
                chromosomes.push({
                    identifier: marker.chromosome.primaryIdentifier,
                    length: marker.chromosome.length
                });
            }
        });
    });

    return chromosomes;
}
