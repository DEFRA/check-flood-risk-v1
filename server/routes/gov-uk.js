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

	// Check long term flood risk - Task start page (GOV.UK)
	{
		method: 'GET',
		path: '/check-long-term-flood-risk',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('gov-uk/check-long-term-flood-risk', {
					'model' : { 'scenario' : scenario },
					'pageTitle' : 'Check long term flood risk - GOV.UK',
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
	// Plan ahead for flooding
	//

	{
		method: 'GET',
		path: '/plan-ahead-for-flooding',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/plan-ahead-for-flooding', {
					'pageTitle' : 'How to plan ahead for flooding - GOV.UK',
					'pageDescription' : 'What to do before a flood: how to protect your porpeorty; get insurance; sign up to flood warnings and make a flood plan.',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	//
	// What to do in a flood
	//

	// Overview
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

	// Getting a flood alert
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-flood-alert',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-flood-alert', {
					'pageTitle' : 'What to do if you get a flood alert - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Getting a flood warning
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-flood-warning',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-flood-warning', {
					'pageTitle' : 'What to do if you get a flood warning - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	// Getting a severe flood warning
	{
		method: 'GET',
		path: '/what-to-do-in-a-flood/getting-a-severe-flood-warning',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/what-to-do-in-a-flood/getting-a-severe-flood-warning', {
					'pageTitle' : 'What to do if you get a severe flood warning - GOV.UK',
					'pageDescription' : '',
					'bodyClasses': 'guide',
					'serviceName' : ''
				})
			}
		}
	},

	//
	// Recovering after a flood
	//

	{
		method: 'GET',
		path: '/recovering-after-a-flood',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/recovering-after-a-flood', {
					'pageTitle' : 'How to recover after a flood - GOV.UK',
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
	},

	//
	// Cookies
	//

	{
		method: 'GET',
		path: '/cookies',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/cookies', {
					'pageTitle' : 'Cookies - Flood information service - GOV.UK',
					'pageDescription' : 'The Environment Agency uses cookies to collect data about how users browse the site. This page explains what they do and how long they stay on your device.',
					'bodyClasses': 'guide',
					'serviceName' : 'Flood information service'
				})
			}
		}
	},

	//
	// Privacy policy
	//

	{
		method: 'GET',
		path: '/privacy-policy',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/privacy-policy', {
					'pageTitle' : 'Privacy policy - Flood information service - GOV.UK',
					'pageDescription' : 'The Environment Agency collects certain information or data about you when you use the service. This policy explains how we handle your information.',
					'bodyClasses': 'guide',
					'serviceName' : 'Flood information service'
				})
			}
		}
	},

	//
	// Terms and conditions
	//

	{
		method: 'GET',
		path: '/terms-conditions',
		config: {
			handler: function (request, reply) {
				return reply.view('gov-uk/terms-conditions', {
					'pageTitle' : 'Terms and conditions - Flood information service - GOV.UK',
					'pageDescription' : 'This page explains the terms and conditions for using this site, our linking policy and the disclaimers attached to the information.',
					'bodyClasses': 'guide',
					'serviceName' : 'Flood information service'
				})
			}
		}
	}

]
