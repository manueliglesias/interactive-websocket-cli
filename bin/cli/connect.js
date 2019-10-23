const WebSocket = require('ws');
const Keyboard = require('../../components/keyboard')

module.exports = (program) => {
  const ws = new WebSocket(program.address)
  ws.on('close', () => process.exit(1))
  
  if (program.pipeStdin) {
    // Pipe
    var duplex = WebSocket.createWebSocketStream(ws)
    program.in.pipe(duplex)
    duplex.pipe(program.out)
  }
  else {
    // Interactive
    ws.on('open', () => console.log('!!! Connected'))
    var keyboard = new Keyboard(program);
    
    ws.on('message', msg => {
      keyboard.printWS(msg)
      keyboard.fix_prompt()
    })

    keyboard.on('s', () => {
      keyboard.prompt('send').then(raw => {
        try {
          ws.send(raw)
        }
        catch (e) {
          console.error(e)
        }
      })
    })

    keyboard.on('h', () => {
      console.log(`
      [s] send a message to server
      `)
    })
  }
}