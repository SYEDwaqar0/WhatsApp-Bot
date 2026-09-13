const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys')
const { useSingleFileAuthState } = require('@whiskeysockets/baileys')

const { state, saveState } = useSingleFileAuthState('./session.json')

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveState)

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || ''
        const from = msg.key.remoteJid

        if (text.toLowerCase() === 'salam') {
            await sock.sendMessage(from, { text: 'وعلیکم السلام ❤️' })
        }

        if (text === '.menu') {
            let menu = `*میرا بوٹ مینو*
1. salam - سلام کا جواب
2..menu - یہ مینو
3..ping - چیک کرو بوٹ آن ہے`
            await sock.sendMessage(from, { text: menu })
        }

        if (text === '.ping') {
            await sock.sendMessage(from, { text: 'بوٹ آن ہے ✅' })
        }
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            if ((lastDisconnect.error)?.output?.statusCode!== DisconnectReason.loggedOut) {
                startBot()
            }
        }
    })
}

startBot()
