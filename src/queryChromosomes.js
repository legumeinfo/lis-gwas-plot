/**
 * Query all chromosomes in the given genome assembly to get lengths.
 */
export default function queryChromosomes(prefix, serviceUrl, imjsClient = imjs) {
    return new Promise((resolve, reject) => {
	// eslint-disable-next-line
	const service = new imjsClient.Service({ root: serviceUrl });
	service
	    .records(pathQuery({ prefix }))
	    .then(data => {
		if (data && data.length) {
                    resolve(data);
		} else {
                    reject('Chromosomes not found for prefix:'+prefix);
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
const pathQuery = ({ prefix }) => ({
    from: 'Chromosome',
    select: [
        'primaryIdentifier',
        'name',
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
            path: 'primaryIdentifier',
            op: 'CONTAINS',
            value: prefix
        }
    ]
});
