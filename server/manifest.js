const config = require('../config')

const manifest = {
  server: {
    connections: {
      routes: {
        auth: {
          mode: 'required',
          strategy: 'simple'
        },
        validate: {
          options: {
            abortEarly: false
          }
        },
        cache: {
          otherwise: 'no-cache, must-revalidate, max-age=0, no-store'
        },
        security: {
          xframe: 'deny',
          hsts: {
            includeSubDomains: true
          }
        }
      }
    }
  },
  connections: [
    {
      port: process.env.PORT || config.server.port,
      host: process.env.HOST || config.server.host,
      labels: config.server.labels
    }
  ],
  registrations: [
    {
      plugin: {
        register: 'hapi-auth-basic'
      }
    },
    {
      plugin: {
        register: './plugins/auth'
      }
    },
    {
      plugin: {
        register: 'inert'
      }
    },
    {
      plugin: {
        register: 'vision'
      }
    },
    {
      plugin: {
        register: 'lout'
      }
    },
    {
      plugin: {
        register: 'good',
        options: config.logging
      }
    },
    {
      plugin: {
        register: './plugins/ext-pre-response'
      }
    }
  ]
}

module.exports = manifest
