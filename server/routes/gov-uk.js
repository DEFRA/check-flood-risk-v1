module.exports = [

	// Flooding and extreme weather - Service start page (GOV.UK)
	{
		method: 'GET',
		path: '/flooding-extreme-weather',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/flooding-extreme-weather', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Flooding and extreme weather - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Check flood risk - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/check-flood-risk',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/check-flood-risk', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Check flood risk - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Check a propeties long term flood risk - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/get-property-flood-risk-assessment',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/get-property-flood-risk-assessment', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Get a property&#39;s flood risk assessment - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Find flood risk for planning - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/guidance/flood-risk-assessment-for-planning-applications',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/flood-risk-assessment-for-planning', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Flood risk assessment for planning applications - GOV.UK',
					'serviceName' : '',
					'isGuidance' : true
				})
			}
		}
	},

	// Get flood warnings - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/get-flood-warnings',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/get-flood-warnings', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Get flood warnings - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Report a flood - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/report-a-flood',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/report-a-flood', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Report a flood - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Check if you need permission to do flood work
	{
		method: 'GET',
		path: '/check-permission-to-do-flood-work',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/check-permission-to-do-flood-work', {
					'pageTitle' : 'Check permission to do flood work - GOV.UK',
					'serviceName' : ''
				})
			}
		}
	},

	// Find sandbags
	{
		method: 'GET',
		path: '/sandbags',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/find-sandbags', {
					'pageTitle' : 'Find out where to get sandbags - GOV.UK',
					'serviceName' : 'Find sandbags'
				})
			}
		}
	},

	// Check flood history
	{
		method: 'GET',
		path: '/check-flood-history',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/flood-history', {
					'pageTitle' : 'Check a property&apos;s flood history - GOV.UK',
					'serviceName' : 'Check a property&apos;s flood history'
				})
			}
		}
	},

	//
	// Preapring
	//

	{
		method: 'GET',
		path: '/plan-ahead-for-a-flood',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/plan-ahead-for-a-flood', {
					'pageTitle' : 'How to plan ahead for flooding - GOV.UK',
					'pageDescription' : 'What to do before a flood: how to protect your porpeorty; get insurance; sign up to flood warnings and make a flood plan.',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	//
	// Responding
	//

	// What to do in a flood - Overview
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/overview', {
					'pageTitle' : 'What to do in a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// What to do in a flood - Getting a flood alert
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-flood-alert',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-flood-alert', {
					'pageTitle' : 'Getting a flood alert - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// What to do in a flood - Getting a flood warning
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-flood-warning',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-flood-warning', {
					'pageTitle' : 'Getting a flood warning - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// What to do in a flood - Getting a severe flood warning
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-severe-flood-warning',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-severe-flood-warning', {
					'pageTitle' : 'Getting a severe flood warning - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	//
	// Recover
	//

	// Recovering from a flood - Contact your insurance company
	{
		method: 'GET',
		path: '/recovering-after-a-flood',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/contact-insurance-company', {
					'pageTitle' : 'Contact your insurance company - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Get help
	{
		method: 'GET',
		path: '/recovering-after-a-flood/get-help',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/get-help', {
					'pageTitle' : 'Get help - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Check if you can return home
	{
		method: 'GET',
		path: '/recovering-after-a-flood/check-if-you-can-return-home',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/check-if-you-can-return-home', {
					'pageTitle' : 'Check if you can return home - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Clean up
	{
		method: 'GET',
		path: '/recovering-after-a-flood/clean-up',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/clean-up', {
					'pageTitle' : 'Clean up - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Stay healthy
	{
		method: 'GET',
		path: '/recovering-after-a-flood/stay-healthy',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/stay-healthy', {
					'pageTitle' : 'Stay healthy - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Make repairs
	{
		method: 'GET',
		path: '/recovering-after-a-flood/make-repairs',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/make-repairs', {
					'pageTitle' : 'Make repairs - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Recovering from a flood - Prepare for future floods
	{
		method: 'GET',
		path: '/recovering-after-a-flood/prepare-for-future-floods',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood/prepare-for-future-floods', {
					'pageTitle' : 'Prepare for future floods - Recovering form a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	//
	// What happens after a flood
	//

	{
		method: 'GET',
		path: '/what-happens-after-a-flood',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-happens-after-a-flood', {
					'pageTitle' : 'What happens after a flood - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	}

]
