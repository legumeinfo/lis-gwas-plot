const main = require('../src').main;

// Example
describe('main', () => {
	test('should throw error when called with wrong signature', () => {
		expect(() => {
			// testing with all falsy values
			main('', 0, null, undefined, []);
		}).toThrowError('Call main with correct signature');
	});
	test('should render loading immediately when intialised', () => {
		const mockData = {
			el: document.createElement('div'),
			service: { root: 'https://mines.legumeinfo.org/soymine/' },
			state: { testing: true },
			entity: { value: '875000005' },
			config: {}
		};
		expect(() => {
			main(
				mockData.el,
				mockData.service,
				mockData.entity,
				mockData.state,
				mockData.config
			);
			expect(mockData.el.innerHTML).toContain('div');
		});
	});
});
