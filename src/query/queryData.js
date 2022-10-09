/**
 * Query the results from a GWAS given by gwasId.
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

// view="GWASResult.pValue
//       GWASResult.gwas.primaryIdentifier GWASResult.gwas.synopsis
//       GWASResult.markers.name GWASResult.markers.chromosome.name GWASResult.markers.chromosomeLocation.start GWASResult.markers.chromosomeLocation.end" 
const pathQuery = ({ gwasId }) => ({
    from: 'GWASResult',
    select: [
        'pValue',
        'gwas.primaryIdentifier',
        'markers.name',
        'markers.chromosome.name',
        'markers.chromosome.primaryIdentifier',
        'markers.chromosome.assemblyVersion',
        'markers.chromosome.length',
        'markers.chromosomeLocation.start',
        'markers.chromosomeLocation.end'
    ],
    orderBy: [
        {
            path: 'markers.chromosome.primaryIdentifier',
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
