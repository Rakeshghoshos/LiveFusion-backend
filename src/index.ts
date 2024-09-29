import express,{Request,Response} from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import RoomManager,{generateRoomId ,Users} from "./managers/RoomManager";
const app = express();
const server = createServer();

const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/",(req:Request,res:Response)=>{
    res.status(200).json({"message":"server working"});
});


io.on("connection",(socket)=>{
    socket.on("createRoom",async ()=>{
        const roomId:string = await generateRoomId();
        socket.join(roomId);
        RoomManager.createRoom(socket.id,"",roomId);
        socket.emit("roomId",{roomId});
    });
    
    socket.on("joinRoom",({roomId})=>{
       let isSet = RoomManager.setUserToRoom(roomId,socket.id);
        const data = RoomManager.getRoomDetails(roomId);
        console.log(data ,isSet);
        if(data){
            const users = data.get(roomId);
           if(users?.user1 && users?.user2){
            io.to(users.user1).emit("userJoin",{user:users.user2});
            io.to(users.user2).emit("userJoin",{user:users.user1});
      console.log(users.user1 + " will create the offer for " + users.user2);
           }else {
            console.log("User1 or User2 not set:", users);
          }
        }else{
            socket.emit("notJoined","");
        }
    });

    socket.on("getMettingStartUser",({roomId})=>{
      const data = RoomManager.getRoomDetails(roomId);
      if(data){
        const users = data.get(roomId);
        if(users?.user1 && users?.user2){
          io.to(users?.user1).emit("getMettingStartUser",{user1:users.user1});
        }
      }
    });

    socket.on("offer", (data) => {
        io.to(data.remoteSocketId).emit("incomingCall", { id: socket.id, offer: data.offer });
    });

    socket.on("accepted", (data) => {
        io.to(data.id).emit("accepted", { id: socket.id, ans: data.ans });
    });

    socket.on("negotiation", (data) => {
        io.to(data.id).emit("negotiation", { id: socket.id, offer: data.offer });
      });
    
      socket.on("negotiation-done", (data) => {
        io.to(data.id).emit("negotiation-final", { id: socket.id, ans: data.ans });
      });
      
       // Handle ICE candidate exchange
  socket.on("ice-candidate", (data) => {
    io.to(data.remoteSocketId).emit("ice-candidate", { candidate: data.candidate });
  });

  socket.on("message",(data)=>{
    socket.broadcast.emit("message",data);
  });

  socket.on("endCall",()=>{
    socket.broadcast.emit("endCall","");
  });

  socket.on("disconnect",()=>{
    console.log("user disconnected"+ " "+socket.id);
  });
});

server.listen(process.env.PORT,()=>{
    console.log("server run on port: "+process.env.PORT);
});