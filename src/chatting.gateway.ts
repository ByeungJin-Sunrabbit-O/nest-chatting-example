import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from "@nestjs/websockets";
import { Server } from "http";
import { from, map, Observable } from "rxjs";
import { Socket } from "socket.io";

@WebSocketGateway(80, {
  namespace: "chat",
  cors: { origin: "*" },
  transports: ["websocket"],
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("join")
  joinRoom(@MessageBody() req, @ConnectedSocket() client: Socket) {
    console.log(client.id);
    client.join(req?.roomId);
  }

  @SubscribeMessage("sendMessage")
  listenMessage(@MessageBody() req, @ConnectedSocket() client: Socket) {
    console.log(client.id);
    client.broadcast.to(req?.roomId).emit("listenMessage", req?.message);
  }

  @SubscribeMessage("leave")
  leaveRoom(@MessageBody() req, @ConnectedSocket() client: Socket) {
    client.leave(req?.roomId);
  }
  @SubscribeMessage("information")
  getInformation(
    @ConnectedSocket() client: Socket,
  ): Observable<WsResponse<string>> {
    console.log(`id : ${client.id}, room list : ${client.rooms.size}`);

    return from(client.rooms.values()).pipe(
      map((i) => ({ event: "information", data: i })),
    );
  }
}
