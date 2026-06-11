const roomService = require('../services/room.service');

exports.createRoom = async (req, res) => {
  try {
    const { room_name } = req.body;
    if (!room_name) {
      return res.status(400).json({
        message: 'Room name is required'
      });
    }   

    const room = await roomService.createRoom(room_name);

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create room' });
  }

};

exports.getRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const room = await roomService.getRoom(room_id);
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch room' });
  } 
};

exports.deleteRoom = async (req, res) => {    
    try {
        const { room_id } = req.params;
        const deleted = await roomService.deleteRoom(room_id);
        if (!deleted) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {

        res.status(500).json({ message: 'Failed to delete room' });
    }
};

