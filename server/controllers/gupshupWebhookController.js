const { query } = require('../config/postgres');

/**
 * Gupshup WhatsApp message-event webhook.
 *
 * Gupshup posts delivery lifecycle events (enqueued/sent/delivered/read/failed)
 * asynchronously after the initial submit response, which is the only thing
 * our own API call sees. This is the sole source of truth for what actually
 * happened to a message on WhatsApp's side.
 *
 * Payload shape (Gupshup "message-event"):
 * { type: "message-event", payload: { id, type, destination, payload: { reason, code } } }
 */
const handleGupshupWebhook = async (req, res) => {
    // Ack immediately - Gupshup retries on non-2xx/timeout, and we never want
    // a slow DB or a malformed payload to cause duplicate/growing retries.
    res.status(200).json({ success: true });

    try {
        const body = req.body || {};
        const eventPayload = body.payload || {};
        // The first ("enqueued") event's `id` is the Gupshup message id we stored.
        // Every later-lifecycle event (sent/delivered/read/failed) reuses `id` for
        // WhatsApp's own internal message id instead, and carries our original
        // Gupshup id back in `gsId` - so gsId must win whenever it's present.
        const gsMessageId = eventPayload.gsId || eventPayload.id;
        const eventType = eventPayload.type; // enqueued | sent | delivered | read | failed
        const failReason = eventPayload.payload?.reason || eventPayload.reason || null;

        if (!gsMessageId || !eventType) {
            console.log('[Gupshup Webhook] Ignoring unrecognized payload:', JSON.stringify(body));
            return;
        }

        const result = await query(`
            UPDATE notification_logs
            SET delivery_status = jsonb_set(
                    delivery_status,
                    '{whatsapp}',
                    COALESCE(delivery_status->'whatsapp', '{}'::jsonb) || jsonb_build_object(
                        'state', $1::text,
                        'failReason', $2::text,
                        'eventTimestamp', to_jsonb(NOW())
                    )
                ),
                updated_at = NOW()
            WHERE delivery_status->'whatsapp'->>'messageId' = $3
            RETURNING id
        `, [eventType, failReason, gsMessageId]);

        if (result.rowCount === 0) {
            // Dump the full payload (not just the id) - Gupshup appears to reference
            // messages by a different id scheme partway through the lifecycle, and we
            // need the raw shape to figure out what field actually links back to ours.
            console.log(`[Gupshup Webhook] No matching notification_log for message id ${gsMessageId}. Full payload:`, JSON.stringify(body));
        } else {
            console.log(`[Gupshup Webhook] ${gsMessageId} -> ${eventType}${failReason ? ' (' + failReason + ')' : ''}`);
        }
    } catch (err) {
        console.error('[Gupshup Webhook] Processing error:', err.message);
    }
};

module.exports = { handleGupshupWebhook };
