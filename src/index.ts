import express, {Request, Response} from "express";
import {Server} from "socket.io";
import {createServer} from "http";
import {MessageType} from "./types";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello world</h1>');
});

const messages = [
    {message: 'Hello', id: '1', user: {userId: '01', name: 'Nastya'}},
    {message: 'world', id: '2', user: {userId: '01', name: 'Nastya'}},
] as MessageType[]

const users = new Map();

io.on('connection', (socket) => {

    socket.on('disconnect', () => {
        users.delete(socket)
    })

    users.set(socket, {userId: new Date().getTime().toString(), name: 'unknown'})

    socket.on('client-name-sent', (name: string) => {
        const user = users.get(socket)
        user.name = name

        socket.emit('client-name', name)
    })

    socket.emit('init-messages', messages);

    socket.on('client-message-sent', (message: string) => {
        console.log(message)
        if (typeof message !== 'string' || !message) {
            return
        }

        const newMessage = {
            message,
            id: new Date().getTime().toString(),
            user: users.get(socket)
        }
        messages.push(newMessage)

        socket.emit('new-message', newMessage)
    })

    console.log('a user connected');
});


const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
    console.log('listening on *:3009');
});