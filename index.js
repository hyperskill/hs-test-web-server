// @ts-check
'use strict'

const execa = require('execa')
const waitOn = require('wait-on')
const Promise = require('bluebird')
const psTree = require('ps-tree')

module.exports = ({service, runTests}) => {
  let url = service.url;
  let start = 'node node_modules/hs-start-server-and-test/start.js'
  const server = execa(`${start} port:${service.port} host:${service.host}`, { shell: true, stdio: 'inherit' })
  let serverStopped

  function stopServer () {
    if (!serverStopped) {
      serverStopped = true
      return Promise.fromNode(cb => psTree(server.pid, cb))
        .then(children => {
          children.forEach(child => {
            try {
              process.kill(child.PID, 'SIGINT')
            } catch (e) {
              if (e.code === 'ESRCH') {
                console.log(
                  `Child process ${child.PID} exited before trying to stop it`
                )
              } else {
                throw e
              }
            }
          })
        })
        .then(() => {
          server.kill()
        })
    }
  }

  const waited = new Promise((resolve, reject) => {
    const onClose = () => {
      reject(new Error('server closed unexpectedly'))
    }

    server.on('close', onClose)

    const options = {
      resources: Array.isArray(url) ? url : [url],
      interval: 2000,
      window: 1000
    }

    waitOn(options, err => {
      if (err) {
        return reject(err)
      }
      server.removeListener('close', onClose)
      resolve()
    })
  })

  return waited
    .tapCatch(stopServer)
    .then(runTests)
    .finally(stopServer)
}

