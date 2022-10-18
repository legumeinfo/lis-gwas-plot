/**
 * Query the results from a GWAS with all markers.
 *
 */
export default function queryGWAS(gwasId, serviceUrl, imjsClient = imjs) {
    return new Promise((resolve, reject) => {
        const query = pathQuery({ gwasId });
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

// multiple assembly versions may be returned
const pathQuery = ({ gwasId }) => ({
    from: 'GWASResult',
    select: [
        'markers.organism.abbreviation',
        'markers.strain.identifier',
        'markers.assemblyVersion',
        'markers.primaryIdentifier',
        'markers.chromosome.name',
        'markers.chromosomeLocation.start',
        'markers.chromosomeLocation.end',
        'trait.name',
        'pValue'
    ],
    sortOrder: [
        {
            path: 'markers.organism.abbreviation',
            direction: 'ASC'
        },
        {
            path: 'markers.strain.identifier',
            direction: 'ASC'
        },
        {
            path: 'markers.assemblyVersion',
            direction: 'ASC'
        },
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
	}
    ]
});
