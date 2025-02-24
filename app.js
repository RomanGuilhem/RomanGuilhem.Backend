import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';

import viewsRouter from './routes/viewsRouter.js';

import { server } from 'socket.io';

const app = express();
const httpServer = app.listen (8080, () => console.log ('Listening on PORT 8080'));
const io = new Server(httpServer);

app.engine('hanglebars', handlebars.engine());
app.set('views', __dirname +'/views');
app.set('view engine', 'handlebars');
app.use('/', viewsRouter);

let messages = [];
io.on('connection', socket => {
    console.log(`Nuevo cliente conectado: ${socket.id}`);

    socket.on('userAuthenticated', user  => {
        socket.emit('messageLogs', messages);
        socket.broadcast.emit('newUserConnected', user);
    })
    socket.on('message', (data) => {
        messages.push(data);
        io.emit('messageLogs', messages);
    })
})
