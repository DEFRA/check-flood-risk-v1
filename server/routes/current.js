const modelData = require('../models/current')

module.exports = [

	// Find location
	{
		method: 'GET',
		path: '/find-location',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('current/find-location', {
					'model' : { 'location' : '', 'scenario' : scenario },
					'pageTitle' : 'Find location - Check flood risk - GOV.UK'
				})
			}
		}
	},

	// Form post
	{
		method: 'POST',
		path: '/find-location',
		config: {
			handler: function (request, reply) {
				const scenario = request.payload.scenario ? request.payload.scenario : 'a'
				const location = request.payload.location
				var path = modelData.getLocationPathFromValue(location, scenario)
				// Redirect to risk summary
				if (path.length > 1) {
					return reply.redirect('/' + path + '?s=' + scenario)
				}
				// Location doesn't exist in prototype
				return reply.view('current/find-location', {
					'model' : { 'location' : location, 'scenario' : scenario },
					'pageTitle' : 'Check flood risk - GOV.UK'
				})
			}
		}
	},
	
	// Location page (Risk summary)
	{
		method: 'GET',
		path: '/{location}',
		config: {
			handler: function (request, reply) {
				const path = request.params.location.toLowerCase().split(' ').join('-')
				const scenario = request.query.s ? request.query.s : 'a'
				const model = modelData.getSummary(path, scenario)
				const pageTitle = model.location + ' - Current flood risk - GOV.UK'
				// Single detail page
				return reply.view('current/detail', {
					'model': model,
					'pageTitle' : pageTitle
				})
				/*
				if (model.hasAlertOrWarning) {
					return reply.view('current/summary-warning', {
						'model': model,
						'pageTitle' : pageTitle
					})
				} else {
					return reply.view('current/summary-normal', {
						'model': model,
						'pageTitle' : pageTitle
					})
				}
				*/
			}
		}
	}

]
