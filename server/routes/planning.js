const utilities = require('../utilities/utilities.js')
const modelData = require('../models/planning')
var Joi = require('joi')

module.exports = [
	{
		method: 'GET',
		path: '/flood-risk-assessment/find-location',
		config: {
			handler: function (request, reply) {
				
				var model = { 'type' : 'place' }

				return reply.view('planning/find-location', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Find location - Check flood zone - GOV.UK',
					'model' : model
				})

			}
		}
	},
	{
		method: 'POST',
		path: '/flood-risk-assessment/find-location',
		config: {
			handler: function (request, reply) {

				var model = modelData.getLocation(
					request.url.path,
					request.payload.type, 
					request.payload.place,
					request.payload.ngr,
					request.payload.easting,
					request.payload.northing,
					request.payload.scenario
				)

				// Search type is place
				if (model.hasLocation) {

					// Location is in England
					if (model.isEngland) {
						return reply.redirect('/flood-risk-assessment/identify-site?lonLat=' + model.lonLat)
					}
					
					// Location is in Scotland, Wales or Northern Ireland
					else {
						return reply.view('planning/alternate-service', {
							'serviceName' : 'Check flood zone',
							'pageTitle' : 'Error: Find location - Check flood zone - GOV.UK',
							'model' : model
						}) // .code(error ? 400 : 200) // HTTP status code depending on error
					}

				}

				// Can't find the location
				else {
					return reply.view('planning/find-location', {
						'serviceName' : 'Check flood zone',
						'pageTitle' : 'Error: Find location - Check flood zone - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}

			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					place: Joi.any().when('type', {
						is: 'place',
						then: Joi.string().required(),
						otherwise: Joi.optional()
					}),
					ngr: Joi.any().when('type', {
						is: 'ngr',
						then: Joi.string().required(),
						otherwise: Joi.optional()
					}),
					easting: Joi.any().when('type', {
						is: 'en',
						then: Joi.string().required(),
						otherwise: Joi.optional()
					}),
					northing: Joi.any().when('type', {
						is: 'en',
						then: Joi.string().required(),
						otherwise: Joi.optional()
					}),
					type: Joi.string()
				},
				failAction: function (request, reply, source, error) {

					var model = modelData.getLocation(
						request.url.path,
						request.payload.type, 
						request.payload.place,
						request.payload.ngr,
						request.payload.easting,
						request.payload.northing,
						request.payload.scenario,
						error
					)
					
					return reply.view('planning/find-location', {
						'serviceName' : 'Check flood zone',
						'pageTitle' : 'Error: Find location - Check flood zone - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error

				}
			}
		}
	},
	{
		method: 'GET',
		path: '/flood-risk-assessment/identify-site',
		config: {
			handler: function (request, reply) {

				var model = modelData.getBoundary(
					request.url.path,
					request.query.lonLat || '[]',
					request.query.site || '',
					'',
					''
				)

				return reply.view('planning/identify-site', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Identify boundary - Check flood zone - GOV.UK',
					'model' : model
				})

			}
		}
	},
	{
		method: 'POST',
		path: '/flood-risk-assessment/identify-site',
		config: {
			handler: function (request, reply) {
				
				const coordinates = request.payload.coordinates

				return reply.redirect('/flood-risk-assessment/site-reference')

			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					coordinates: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {
					
					var model = modelData.getBoundary(
						request.url.path,
						request.payload.lonLat,
						'',
						request.payload.geoJson,
						'POST'
					)

					return reply.view('planning/identify-site', {
						'serviceName' : 'Check flood zone',
						'pageTitle' : 'Error: Identify boundary - Check flood zone - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}
			}
		}
	}
]