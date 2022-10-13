/**
 * Query all chromosomes in the given genome assembly.
 */
export default function queryChromosomes(genome, serviceUrl, imjsClient = imjs) {
    return new Promise((resolve, reject) => {
	// eslint-disable-next-line
	const service = new imjsClient.Service({ root: serviceUrl });
	service
	    .records(pathQuery({ genome }))
	    .then(data => {
		if (data && data.length) {
                    resolve(data);
		} else {
                    reject('Chromosomes not found for genome:'+JSON.stringify(genome));
                }
	    })
	    .catch(reject);
    });
}

// Chromosome.primaryIdentifier
// Chromosome.length
// Chromosome.name
// sortOrder="Chromosome.primaryIdentifier asc"
// path="Chromosome.primaryIdentifier" op="CONTAINS" value="phavu.G19833.gnm2"
const pathQuery = ({ genome }) => ({
    from: 'Chromosome',
    select: [
        'name',
        'primaryIdentifier',
        'length'
    ],
    orderBy: [
        {
            path: 'name',
            direction: 'ASC'
        }
    ],
    where: [
        {
            path: 'organism.abbreviation',
            op: '=',
            value: genome.abbreviation
        },
        {
            path: 'strain.identifier',
            op: '=',
            value: genome.strain
        },
        {
            path: 'assemblyVersion',
            op: '=',
            value: genome.assemblyVersion
        },
    ]
});
