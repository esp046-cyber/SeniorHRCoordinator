/**
 * Reference serverless function (Vercel / Netlify / AWS Lambda style).
 * NOT used by the static PWA. Deploy separately if you want Slack alerts or HRIS notifications.
 *
 * Environment variables: see ../.env.example
 * Payloads: see ../api/hr-tasks-schema.json (webhookEvent)
 *
 * Example request:
 *   curl -X POST https://your-function.example.com/api/hr-webhook \
 *     -H "Content-Type: application/json" -H "X-Webhook-Secret: $WEBHOOK_SHARED_SECRET" \
 *     -d '{"event":"sla.breach","timestamp":"2026-11-16T07:30:00Z","message":"Tier-2 ticket HR-1042 unanswered for 4h"}'
 */
"use strict";

const crypto = require("crypto");

const ALLOWED_EVENTS = new Set(["task.completed", "sla.breach", "compliance.escalated", "data.discrepancy"]);

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Never forward SSNs or other sensitive identifiers to chat tools.
function redact(text) {
  return String(text || "").replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, "[REDACTED-SSN]").slice(0, 1000);
}

function formatSlack(evt) {
  const icon = { "task.completed": "✅", "sla.breach": "⏱️", "compliance.escalated": "🚨", "data.discrepancy": "⚠️" }[evt.event] || "ℹ️";
  const lines = [icon + " *" + evt.event + "* at " + evt.timestamp];
  if (evt.task) lines.push("Task: " + redact(evt.task.title) + " (owner: " + evt.task.owner + ", priority: " + evt.task.priority + ")");
  if (evt.case) lines.push("Case: " + redact(evt.case.caseId) + " [" + evt.case.category + "] status: " + evt.case.status);
  if (evt.message) lines.push(redact(evt.message));
  return { text: lines.join("\n") };
}

async function postJson(url, body, headers) {
  const res = await fetch(url, { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, headers || {}), body: JSON.stringify(body) });
  if (!res.ok) throw new Error("Upstream responded " + res.status);
  return res;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.statusCode = 405; res.setHeader("Allow", "POST"); return res.end("Method Not Allowed"); }

  const secret = process.env.WEBHOOK_SHARED_SECRET;
  if (!secret || !safeEqual(req.headers["x-webhook-secret"], secret)) { res.statusCode = 401; return res.end("Unauthorized"); }

  let evt = req.body;
  if (typeof evt === "string") { try { evt = JSON.parse(evt); } catch (e) { res.statusCode = 400; return res.end("Invalid JSON"); } }
  if (!evt || !ALLOWED_EVENTS.has(evt.event) || !evt.timestamp) { res.statusCode = 422; return res.end("Invalid event"); }

  try {
    if (process.env.SLACK_WEBHOOK_URL) await postJson(process.env.SLACK_WEBHOOK_URL, formatSlack(evt));

    // Optional HRIS note. Adapt the endpoint and auth to your provider's API.
    if (evt.event === "data.discrepancy" && process.env.HRIS_BASE_URL && process.env.HRIS_API_KEY) {
      await postJson(process.env.HRIS_BASE_URL + "/notes", { note: redact(evt.message), source: "hr-command-center" }, { Authorization: "Bearer " + process.env.HRIS_API_KEY });
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 502;
    return res.end("Upstream error");
  }
};

module.exports.formatSlack = formatSlack;
module.exports.redact = redact;
