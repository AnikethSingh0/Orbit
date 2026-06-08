const generateRoomId = (senderId, receiverId) => {
    const sortedIds = [senderId.toString(), receiverId.toString()].sort();
    return sortedIds.join('_');
}

module.exports = generateRoomId;
