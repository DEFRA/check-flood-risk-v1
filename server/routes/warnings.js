const modelData = require('../models/warning')

module.exports = [

	// Warnings list page
	{
		method: 'GET',
		path: '/warnings',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				const trace = request.query.t ? request.query.t : false
				const model = modelData.getWarnings('', scenario)
				return reply.view('warnings/warnings', {
					'model' : model,
					'trace' : trace,
					'pageTitle' : 'Flood alerts and warnings - Check flood risk - GOV.UK'
				})
			}
		}
	},

	// Warning detail page
	{
		method: 'GET',
		path: '/warnings/central-mytholmroyd-river-calder',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				const trace = request.query.t ? request.query.t : false
				const model = modelData.getWarnings('', scenario)
				return reply.view('warnings/detail', {
					'model' : model,
					'trace' : trace,
					'bodyClasses' : 'warning',
					'pageTitle' : 'Central Mytholmroyd (River Calder) - Flood warning - GOV.UK'
				})
			}
		}
	}
]