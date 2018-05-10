const modelData = require('../models/long-term')
var Joi = require('joi')

module.exports = [
	{
		method: 'GET',
		path: '/find-property',
		config: {
			handler: function (request, reply) {

				var model = {}

				return reply.view('long-term/find-property', {
					'pageTitle' : 'Find address - Long term flood risk - GOV.UK',
					'model' : model
				})

			}
		}
	},
	{
		method: 'POST',
		path: '/find-property',
		config: {
			handler: function (request, reply) {

				var model = modelData.getProperty(
					request.payload.address
				)	
				
				// If we have an one or more existing addresses
				if (model.hasAddress) {
					return reply.view('long-term/confirm-address', {
						'pageTitle' : 'Select address - Long term flood risk - GOV.UK',
						'model' : model
					})
				}

				// We don't have an existing address
				else {
					return reply.view('long-term/find-property', {
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
					address: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {

					// Pattern match validation fails
					var model = modelData.getProperty(
						request.payload.address, 
						error
					)			
					return reply.view('long-term/find-property', {
						'pageTitle' : 'Error: Find address - Long term flood risk - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error

				}
			}
		}
	},
	// Ajax request
	{
		method: 'POST',
		path: '/get-address-results',
		config: {

			handler: function (request, reply) {

				/*
				var model = modelData.getProperty(
					request.query.address
				)	
				
				// If we have an one or more existing addresses
				if (model.hasAddress) {
					return JSON.stringify(model.result)
				}
				*/

				return {
					'result' : 'true'
				}

			}
		}
	},
	{
		method: 'POST',
		path: '/confirm-address',
		config: {
			handler: function (request, reply) {

				const address = request.payload.address
				return reply.redirect('/long-term/' + address)

			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					address: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {
					
					var model = modelData.getProperty(
						request.payload.address, 
						error
					)

					return reply.view('long-term/confirm-address', {
						'pageTitle' : 'Error: Select address - Long term flood risk - GOV.UK',
						'model' : model
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}
			}
		}
	},
	{
		method: 'GET',
		path: '/long-term/map',
		config: {
			handler: function (request, reply) {

				var model = { 
					'scenario' : request.query.s ? request.query.s : 'a',
					'lonLat' : request.query.lonLat,
					'zoom' : request.query.zoom, 
				}

				return reply.view('long-term/map', {
					'pageTitle' : 'Map - Long term flood risk - GOV.UK',
					'pageClass' : 'long-term-map',
					'model' : model
				})

			}
		}
	}
]