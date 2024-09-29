export interface Users{
    user1:string | null,
    user2:string | null
}

export const generateRoomId = async ()=>{
    const { nanoid } = await import('nanoid');
    const id:string = nanoid(12);
    return id;
}

class RoomManager{
    static rooms:Map<string,Users>[] = [];
    
    static createRoom(user1:string | null,user2:string | null,roomId:any){
        const roomDetails = new Map();
        roomDetails.set(roomId,{user1:user1,user2:user2});
        RoomManager.rooms?.push(roomDetails);
    }

    static setUserToRoom(roomId:string,user:string | null){
        for (const room of RoomManager.rooms) {
            if (room.has(roomId)) {
                const roomDetails = room.get(roomId);
                roomDetails!.user2 = user;
                room.set(roomId,roomDetails!);
                return true;
            }
        }
        return false;
    }

        static getRoomDetails(roomId:string){
            for (const room of RoomManager.rooms) {
                if (room.has(roomId)) {
                    return room;
                }
        }
        return false;
    }

    static removeRoom(roomId:string):string | null{
        if(!roomId){
            return null;
        }
        RoomManager.rooms = RoomManager.rooms.filter((r)=> !r.has(roomId));
        return "removed";
    }
}

export default RoomManager;