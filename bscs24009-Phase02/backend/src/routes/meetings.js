const express = require("express");
const { getClient } = require("../db");
const { authRequired } = require("../middleware/auth");

const meetingsRouter = express.Router();

// Transaction scenario 1: schedule meeting + venue_booking atomically
// POST /api/v1/meetings
meetingsRouter.post("/", authRequired, async (req, res) => {
  const client = await getClient();
  try {
    const { match_id, venue_id, scheduled_time, duration_hours, slots_reserved } = req.body;
    if (!match_id || !venue_id || !scheduled_time || !duration_hours || !slots_reserved) {
      return res.status(400).json({
        error: "match_id, venue_id, scheduled_time, duration_hours, slots_reserved are required",
      });
    }

    await client.query("BEGIN");

    const meetingInsert = await client.query(
      `INSERT INTO meetings (match_id, venue_id, scheduled_time, duration_hours, total_cost, status)
       VALUES ($1, $2, $3, $4::INTEGER, 
              (SELECT v.hourly_rate * $4::INTEGER FROM venues v WHERE v.venue_id = $2),
              'pending')
       RETURNING meeting_id, match_id, venue_id, scheduled_time, duration_hours, total_cost, status`,
      [match_id, venue_id, scheduled_time, duration_hours]
    );

    if (meetingInsert.rows.length === 0) {
      throw new Error("Venue not found");
    }

    const meeting = meetingInsert.rows[0];

    const bookingInsert = await client.query(
      `INSERT INTO venue_bookings (venue_id, meeting_id, time_slot, slots_reserved, status)
       VALUES ($1, $2, $3, $4, 'reserved')
       RETURNING booking_id, venue_id, meeting_id, time_slot, slots_reserved, status`,
      [venue_id, meeting.meeting_id, scheduled_time, slots_reserved]
    );

    const booking = bookingInsert.rows[0];

    await client.query("COMMIT");
    return res.status(201).json({ meeting, booking, transaction: "committed" });
  } catch (err) {
    console.error("Schedule meeting error, rolling back:", err.message || err);
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    if (err.message === "Venue not found") {
      return res.status(400).json({ error: err.message, transaction: "rolled_back" });
    }
    if (err.code === "P0001") {
      return res.status(400).json({ error: err.message, transaction: "rolled_back" });
    }
    return res.status(500).json({ error: "Failed to schedule meeting", transaction: "rolled_back" });
  } finally {
    client.release();
  }
});

// Transaction scenario 2: cancel meeting + booking, revert match status if needed
// POST /api/v1/meetings/:id/cancel
meetingsRouter.post("/:id/cancel", authRequired, async (req, res) => {
  const client = await getClient();
  try {
    const meetingId = Number(req.params.id);
    if (!meetingId) {
      return res.status(400).json({ error: "Valid meeting id is required" });
    }

    await client.query("BEGIN");

    const meetingRes = await client.query(
      "SELECT meeting_id, match_id, status FROM meetings WHERE meeting_id = $1 FOR UPDATE",
      [meetingId]
    );
    if (meetingRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Meeting not found", transaction: "rolled_back" });
    }

    await client.query(
      "UPDATE meetings SET status = 'cancelled' WHERE meeting_id = $1",
      [meetingId]
    );

    await client.query(
      "UPDATE venue_bookings SET status = 'cancelled' WHERE meeting_id = $1",
      [meetingId]
    );

    await client.query("COMMIT");
    return res.json({ message: "Meeting cancelled", transaction: "committed" });
  } catch (err) {
    console.error("Cancel meeting error, rolling back:", err.message || err);
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Rollback failed:", rollbackErr);
    }
    return res.status(500).json({ error: "Failed to cancel meeting", transaction: "rolled_back" });
  } finally {
    client.release();
  }
});

module.exports = { meetingsRouter };

