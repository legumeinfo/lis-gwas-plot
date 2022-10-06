const lisQuery = gwasId => ({
    from: 'GWAS',
    select: [
	'primaryIdentifier',
	'results.pValue',
	'results.phenotype.primaryIdentifier',
	'results.marker.secondaryIdentifier',
	'results.marker.chromosome.length',
	'results.marker.chromosome.secondaryIdentifier',
	'results.marker.chromosomeLocation.start'
    ],
    where: [
	{
	    path: 'id',
	    op: 'ONE OF',
	    values: gwasId
	}
    ]
});

// GWAS.primaryIdentifier
// GWAS.results.pValue
// GWAS.results.phenotype.primaryIdentifier
// GWAS.results.marker.secondaryIdentifier
// GWAS.results.marker.chromosome.secondaryIdentifier
// GWAS.results.marker.chromosome.length
// GWAS.results.marker.chromosomeLocation.start

const queryData = ({ gwasId, serviceUrl, imjsClient = imjs }) => {
    const query = lisQuery;
    const service = new imjsClient.Service({
	root: serviceUrl
    });
    return new Promise((resolve, reject) => {
	service
	    .records(query(gwasId))
	    .then(res => {
		// if (res.length === 0) reject('No data found!');
		resolve(res);
	    })
	    .catch(() => reject('No data found!'));
    });
};

export { queryData };
