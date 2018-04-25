const utilities = require('../utilities/utilities.js')
const modelData = require('../models/planning')
var Joi = require('joi')

/*
var identifySiteSchema = Joi.alternatives().try(
	Joi.object().keys({
		path: Joi.string().allow(''),
		point: Joi.string()
	}),
	Joi.object().keys({
		path: Joi.string(),
		point: Joi.string().allow('')
	})
)
*/

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
					request.query.lonLat,
					request.query.zoom,
					request.query.path,
					request.query.isError
				)

				return reply.view('planning/identify-site', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Identify boundary - Check flood zone - GOV.UK',
					'pageClass' : 'flood-zone-map',
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
				return reply.redirect('/flood-risk-assessment/report?lonLat=' + request.payload.lonLat + '&zoom=' + request.payload.zoom)
			}
			/*
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					path: Joi.string().required()	
				},
				failAction: function (request, reply, source, error) {
					return reply.redirect('/flood-risk-assessment/identify-site?lonLat=' + request.payload.lonLat + '&zoom=' + request.payload.zoom + '&isError=true')
				}
			}
			*/
		}
	},
	{
		method: 'GET',
		path: '/flood-risk-assessment/report',
		config: {
			handler: function (request, reply) {

				var model = {
					lonLat: request.query.lonLat,
					zoom: request.query.zoom,
					path: request.query.path
				}

				return reply.view('planning/report', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Report - Check flood zone - GOV.UK',
					'model' : model
				})

			}
		}
	}
]