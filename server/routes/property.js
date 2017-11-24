const utilities = require('../utilities/utilities.js')
const modelData = require('../models/property')
var Joi = require('joi')

module.exports = [
	{
		method: 'GET',
		path: '/find-address',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				return reply.view('property/find-address', {
					'pageTitle' : 'Find address - Property flood risk - GOV.UK',
					'model' : { 'scenario' : scenario }
				})
			}
		}
	},
	{
		method: 'POST',
		path: '/find-address',
		config: {
			handler: function (request, reply) {

				const scenario = request.payload.scenario ? request.payload.scenario : 'a'
				var premises = request.payload.premises.toLowerCase()
				var postcode = request.payload.postcode.replace(/ /g,'-').toLowerCase()
				var property = modelData.getProperty(premises, postcode, scenario)
				
				// If we have a valid address(s)
				if (property.length) {

					var country = { 'code' : property[0].country, 'name' : '' }
					switch(country.code) {
						case 's':
							country.name = 'Scotland'
							break
						case 'w':
							country.name = 'Wales'
							break
						case 'w':
							country.name = 'Northern Ireland'
							break
						default:
							country.name = 'England'
					}

					// Address(s) are in England
					if (country.code == 'e') {
						return reply.redirect('/select-address?premises=' + premises + '&postcode=' + postcode + '&s='+ scenario)
					}

					// Address(s) are outside England
					else {
						return reply.view('property/alternate-service', {
							'pageTitle' : 'Error: Find address - Property flood risk - GOV.UK',
							'model' : { 'errors' : { 'country' : country } }
						})
					}

				}
				// We don't have a valid address
				else {
					return reply.view('property/find-address', {
						'pageTitle' : 'Error: Find address - Property flood risk - GOV.UK',
						'model' : { 'errors': { 'address' : { 'type' : 'any.empty', 'message' : '' }}, 'values' : { 'premises' : request.payload.premises, 'postcode' : request.payload.postcode, 'scenario' : scenario }, 'scenario' : scenario }
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
					var errors, values
					const scenario = request.payload.scenario ? request.payload.scenario : 'a'
					if(error && error.data) {
						errors = utilities.extractValidationErrors(error) // the error field + message
						values = utilities.getFormInputValues(error) // avoid wiping form data
					}
					return reply.view('property/find-address', {
						'pageTitle' : 'Error: Find address - Property flood risk - GOV.UK',
						'model' : { 'errors'  : errors, 'values' : values, 'scenario' : scenario }
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}
			}
		}
	},
	{
		method: 'GET',
		path: '/select-address',
		config: {
			handler: function (request, reply) {
				const scenario = request.query.s ? request.query.s : 'a'
				const premises = request.query.premises ? request.query.premises : 'error'
				const postcode = request.query.postcode ? request.query.postcode.replace(/\-/g,' ').toUpperCase() : 'error'

				if (premises === 'error' || postcode === 'error') {
					return reply.view('404').code(404)
				}
				
				var property = modelData.getProperty(premises, postcode, scenario)
				var isSingle = property.length > 1 ? false : true
				
				return reply.view('property/select-address', {
					'pageTitle' : 'Select address - Property flood risk - GOV.UK',
					'model' : { 'property' : property, 'isSingle' : isSingle, 'premises' : premises, 'postcode' : postcode, 'scenario' : scenario }
				})
			}
		}
	},
	{
		method: 'POST',
		path: '/select-address',
		config: {
			handler: function (request, reply) {
				const scenario = request.payload.scenario ? request.payload.scenario : 'a'
				const property = request.payload.property ? request.payload.property : ''
				return reply.redirect('/' + property + '?s='+ scenario)
			},
			validate: {
				options: {
					allowUnknown: true
				},
				payload: {
					property: Joi.string().required()
				},
				failAction: function (request, reply, source, error) {
					const scenario = request.payload.scenario ? request.payload.scenario : 'a'
					const premises = request.payload.premises ? request.payload.premises : 'error'
					const postcode = request.payload.postcode ? request.payload.postcode.replace(/\-/g,' ').toUpperCase() : 'error'

					var property = modelData.getProperty(premises, postcode)
					var isSingle = property.length > 1 ? false : true

					var errors, values
					if(error && error.data) {
						errors = utilities.extractValidationErrors(error) // the error field + message
						values = utilities.getFormInputValues(error) // avoid wiping form data
					}
					return reply.view('property/select-address', {
						'pageTitle' : 'Error: Select address - Property flood risk - GOV.UK',
						'model' : { 'property' : property, 'errors'  : errors, 'values' : values, 'isSingle' : isSingle, 'premises' : premises, 'postcode' : postcode, 'scenario' : scenario }
					}) // .code(error ? 400 : 200) // HTTP status code depending on error
				}
			}
		}
	}
]