/**
 * Query the genomes associated with a GWAS (via GWASResult.markers).
 */
export default function queryGenomes(gwasId, serviceUrl, imjsClient = imjs) {
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

// GWASResult.markers.organism.abbreviation
// GWASResult.markers.strain.identifier
// GWASResult.markers.assemblyVersion
// path="GWASResult.gwas.primaryIdentifier" op="=" value="mixed.gwas.Escobar_Oladzad_2022"/>
const pathQuery = ({ gwasId }) => ({
    from: 'GWASResult',
    select: [
        'markers.organism.abbreviation',
        'markers.strain.identifier',
        'markers.assemblyVersion'
    ],
    sortOrder: [
        {
            path: 'markers.assemblyVersion',
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
