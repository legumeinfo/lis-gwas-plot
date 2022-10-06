/**
 * Query the expression for a GWAS given by gwasId.
 */
export default function queryData(gwasId, serviceUrl, imjsClient = imjs) {
    return new Promise((resolve, reject) => {
	// eslint-disable-next-line
	const service = new imjsClient.Service({ root: serviceUrl });
	service
	    .records(pathQuery({ gwasId }))
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

// imjs path query to grab a GWAS
// view="GWAS.primaryIdentifier
//       GWAS.results.pValue
//       GWAS.results.trait.name GWAS.results.trait.description 
//       GWAS.results.markers.name GWAS.results.markers.genotypingPlatform
//       GWAS.results.markers.chromosome.name
//       GWAS.results.markers.chromosomeLocation.start GWAS.results.markers.chromosomeLocation.end GWAS.results.markers.chromosomeLocation.strand"
// sortOrder="GWAS.results.markers.chromosome.name GWAS.results.markers.chromosomeLocation.start asc"
const pathQuery = ({ gwasId }) => ({
    from: 'GWAS',
    select: [
	'primaryIdentifier',
        'results.pValue',
        'results.trait.name',
        'results.trait.description',
        'results.markers.name',
        'results.markers.genotypingPlatform',
        'results.markers.chromosome.name',
        'results.markers.chromosomeLocation.start',
        'results.markers.chromosomeLocation.end',
        'results.markers.chromosomeLocation.strand'
    ],
    orderBy: [
        {
            path: 'results.markers.chromosome.name',
            direction: 'ASC'
        },
        {
            path: 'results.markers.chromosomeLocation.start',
            direction: 'ASC'
        }
    ],
    where: [
	{
	    path: 'id',
	    op: '=',
	    values: gwasId
	}
    ]
});
