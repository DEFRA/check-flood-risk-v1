const utilities = require('../utilities/utilities.js')
var Joi = require('joi')

module.exports = [
	{
		method: 'GET',
		path: '/flood-risk-assessment/find-location',
		config: {
			handler: function (request, reply) {
				return reply.view('planning/find-location', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Find location - Check flood zone - GOV.UK',
					'model' : { 'values' : { 'type' : 'place' }}
				})
			}
		}
	},
	{
		method: 'POST',
		path: '/flood-risk-assessment/find-location',
		config: {
			handler: function (request, reply) {
				return reply.redirect('/flood-risk-assessment/identify-site')
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
					var errors, values
					if(error && error.data) {
						errors = utilities.extractValidationErrors(error) // the error field + message
						values = utilities.getFormInputValues(error) // avoid wiping form data
					}
					return reply.view('planning/find-location', {
						'serviceName' : 'Check flood zone',
						'pageTitle' : 'Error: Find location - Check flood zone - GOV.UK',
						'model' : { 'errors'  : errors, 'values' : values}
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
				return reply.view('planning/identify-site', {
					'serviceName' : 'Check flood zone',
					'pageTitle' : 'Identify boundary - Check flood zone - GOV.UK'
				})
			}
		}
	}
]