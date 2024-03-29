module.exports = function(io, rooms) {
    var chatrooms = io.of('/roomlist').on('connection', function(socket) {
        console.log('Connection Established on the Server !');

        socket.emit('roomupdate', JSON.stringify(rooms));

        socket.on('newroom', function(data) {
            rooms.push(data);
            // send broadcast except the broadcaster(which is the room creator)
            socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
            // send msg to the room creator
            socket.emit('roomupdate', JSON.stringify(rooms));
        });
    });

    var messages = io.of('/messages').on('connection', function(socket) {
        console.log('Connected to the Chatroom !');

        socket.on('joinroom', function(data) {
            socket.userName = data.user;
            socket.userPic = data.userPic;
            socket.join(data.room);
            updateUserList(data.room, true);
        });

        socket.on('newMessage', function(data) {
            socket.broadcast.to(data.room_number).emit('messagefeed', JSON.stringify(data));
        });

        function updateUserList(room, updateAll) {
            var getUsers = io.of('/messages').clients(room);
            var userlist = [];
            for (var i in getUsers) {
                userlist.push({
                    user: getUsers[i].userName,
                    userPic: getUsers[i].userPic
                });
            }
            socket.to(room).emit('updateUsersList', JSON.stringify(userlist));

            if (updateAll) {
                socket.to(room).broadcast.emit('updateUsersList', JSON.stringify(userlist));
            }
        }

        socket.on('updatelist', function(data) {
            updateUserList(data.room);
        });
    });
};
