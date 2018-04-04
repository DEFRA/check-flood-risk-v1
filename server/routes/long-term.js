const modelData = require('../models/long-term')
var Joi = require('joi')

module.exports = [
	{
		method: 'GET',
		path: '/find-address',
		config: {
			handler: function (request, reply) {

				var model = { 'scenario' : request.query.s ? request.query.s : 'a' }

				return reply.view('long-term/find-address', {
					'pageTitle' : 'Find address - Long term flood risk - GOV.UK',
					'model' : model
				})

			}
		}
	},
	{
		method: 'POST',
		path: '/find-address',
		config: {
			handler: function (request, reply) {

				var model = modelData.getProperty(
					request.url.path,
					request.payload.premises, 
					request.payload.postcode, 
					request.payload.scenario
				)	
				
				// If we have an one or more existing addresses
				if (model.hasExistingAddress) {

					// Postcode is England
					if (model.isEngland) {
						return reply.redirect(
							'/confirm-address?premises=' + model.premises + '&postcode=' + model.postcode.replace(/ /g,'-') + '&s='+ model.scenario
						)
					}

					// Postcode is in Scotland, Wales or Northern Ireland
					else {
						return reply.view('long-term/alternate-service', {
							'pageTitle' : 'Error: Find address - Long term flood risk - GOV.UK',
							'model' : model
						})
					}

				}

				// We don't have an existing address
				else {
					return reply.view('long-term/find-address', {
						'pageTitle' : 'Error: Find address - Long term flood risk - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}

			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: { 
					premises: Joi.string().required(),
					postcode: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {

					// Pattern match validation fails

					var model = modelData.getProperty(
						request.url.path,
						request.payload.premises, 
						request.payload.postcode, 
						request.payload.scenario, 
						error
					)			
					
					return reply.view('long-term/find-address', {
						'pageTitle' : 'Error: Find address - Long term flood risk - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error

				}
			}
		}
	},
	{
		method: 'GET',
		path: '/confirm-address',
		config: {
			handler: function (request, reply) {

				var model = modelData.getProperty(
					request.url.path,
					request.query.premises ? request.query.premises : 'error', 
					request.query.postcode ? request.query.postcode : 'error', 
					request.query.s ? request.query.s : 'a'
				)

				return reply.view('long-term/confirm-address', {
					'pageTitle' : 'Select address - Long term flood risk - GOV.UK',
					'model' : model
				})

			}
		}
	},
	{
		method: 'POST',
		path: '/confirm-address',
		config: {
			handler: function (request, reply) {

				const scenario = request.payload.scenario ? request.payload.scenario : 'a'
				const property = request.payload.property

				return reply.redirect('/long-term/' + property + '?s='+ scenario)

			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					property: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {
					
					var model = modelData.getProperty(
						request.url.path,
						request.payload.premises, 
						request.payload.postcode, 
						request.payload.scenario, 
						error
					)

					return reply.view('long-term/confirm-address', {
						'pageTitle' : 'Error: Select address - Long term flood risk - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}
			}
		}
	}
]