import imjs from 'imjs';
import { queryData } from '../src/query';

describe('query', () => {
	const mockData = {
		entity: [875000005],
		service: 'https://mines.legumeinfo.org/soymine/'
	};

	test('should return a promise resolving with correct data', () => {
		const promise = queryData({
			geneId: mockData.entity,
			serviceUrl: mockData.service,
			imjsClient: imjs
		}).catch(() => {});

		expect(promise).resolves.toBeInstanceOf(Array);
		return promise.then(res => {
			expect(res.length).toBeGreaterThanOrEqual(1);
			expect(res[0].results.length).toBeGreaterThanOrEqual(0);
		});
	});

	test('should return a rejected promise when data not available', () => {
		const promise = queryData({
			geneId: '128',
			serviceUrl: mockData.service,
			imjsClient: imjs
		});
		return promise.catch(res => expect(res).toBe('No data found!'));
	});
});
