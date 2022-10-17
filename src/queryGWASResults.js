/**
 * Query the results from a GWAS for a given genome assembly.
 *
 * genome: {
 *   prefix: prefix,
 *   abbreviation: marker.organism.abbreviation,
 *   strain: marker.strain.identifier,
 *   assemblyVersion: marker.assemblyVersion
 * }
 *
 */
export default function queryData(gwasId, genome, serviceUrl, imjsClient = imjs) {
    return new Promise((resolve, reject) => {
        const query = pathQuery({ gwasId, genome });
	// eslint-disable-next-line
	const service = new imjsClient.Service({ root: serviceUrl });
	service
	    .records(query)
	    .then(data => {
		if (data && data.length) {
                    resolve(data);
		} else {
                    reject('No data found!');
                }
	    })
	    .catch(reject);
    });
}

// view="GWASResult.pValue
//       GWASResult.gwas.primaryIdentifier GWASResult.gwas.synopsis
//       GWASResult.markers.name GWASResult.markers.chromosome.name GWASResult.markers.chromosomeLocation.start GWASResult.markers.chromosomeLocation.end" 
const pathQuery = ({ gwasId, genome }) => ({
    from: 'GWASResult',
    select: [
        'pValue',
        'trait.name',
        'markers.name',
        'markers.chromosome.name',
        'markers.chromosomeLocation.start'
    ],
    sortOrder: [
        {
            path: 'markers.chromosome.name',
            direction: 'ASC'
        },
        {
            path: 'markers.chromosomeLocation.start',
            direction: 'ASC'
        }
    ],
    where: [
	{
	    path: 'gwas.id',
	    op: '=',
	    value: gwasId
	},
        {
            path: 'markers.organism.abbreviation',
            op: '=',
            value: genome.abbreviation
        },
        {
            path: 'markers.strain.identifier',
            op: '=',
            value: genome.strain
        },
        {
            path: 'markers.assemblyVersion',
            op: '=',
            value: genome.assemblyVersion
        }
    ]
});
