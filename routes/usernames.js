import { response, express, Router, request } from 'express'
import { roomExists } from "../roomStore";
import roomsRouter from './rooms';

const playerName = Router();
roomsRouter.use(express.json())
roomsRouter.post('/players', (_request, response, next) => {
    console.log(_request.body)

    return next();
}).use(express.json())

roomsRouter.get('/:roomCode', (_request, response, next) => {
    console.log(_request.params.roomCode)
    console.log(_request.body)
})


playerName.post("/players", (_request, response, next) => {
    const roomId = _request.body.roomId;
    const userName = _request.body.players

    console.log(roomId);
    console.log(userName);



    return res.json({
        message: "Room Id received",
        userName: userName,
        roomId: roomId
    });
});

export default playerName;