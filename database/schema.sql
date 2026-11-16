-- Relational schema mirroring the PWA's localStorage model.
-- Compatible with PostgreSQL and SQLite (types kept portable).
-- localStorage key "hrcc.done.v1" = { "<task_id>": true }  ->  task_progress rows.

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,                                   -- e.g. ops-d1, life-pre2, cmp-5
  tab         TEXT NOT NULL CHECK (tab IN ('operations','lifecycle','compliance')),
  group_name  TEXT,                                               -- section or lifecycle stage
  cadence     TEXT NOT NULL,                                      -- Daily, Weekly, Monthly, Quarterly, Bi-annual, Annual, Per hire, Per event, Ongoing
  priority    TEXT NOT NULL CHECK (priority IN ('High','Medium','Low')),
  title       TEXT NOT NULL,
  detail      TEXT NOT NULL,
  owner       TEXT NOT NULL CHECK (owner IN ('HR Coord','IT','Payroll','Hiring Mgr')),
  sla         TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email       TEXT UNIQUE,
  role        TEXT NOT NULL DEFAULT 'HR Coord',
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_progress (
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id      TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completed    INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0,1)),
  completed_at TEXT,
  note         TEXT,
  PRIMARY KEY (user_id, task_id)
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key     TEXT NOT NULL,                                          -- theme, installDismissed
  value   TEXT,
  PRIMARY KEY (user_id, key)
);

CREATE TABLE IF NOT EXISTS compliance_cases (
  case_id      TEXT PRIMARY KEY,
  category     TEXT NOT NULL CHECK (category IN ('I-9','FMLA','ADA','OSHA','ER','Payroll','Data','Other')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','escalated','closed')),
  owner        TEXT NOT NULL DEFAULT 'HR Coord',
  escalated_to TEXT CHECK (escalated_to IN ('HRBP','Legal','Payroll','None')),
  summary      TEXT,                                              -- objective facts only; no SSNs or diagnoses
  opened_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at       TEXT,
  closed_at    TEXT
);

CREATE TABLE IF NOT EXISTS templates (
  id    TEXT PRIMARY KEY,                                         -- tpl-offer, tpl-i9, tpl-offboard, tpl-payroll
  title TEXT NOT NULL,
  usage TEXT,
  body  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kpis (
  id      TEXT PRIMARY KEY,
  label   TEXT NOT NULL,
  target  TEXT NOT NULL,
  formula TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_tab_cadence ON tasks (tab, cadence);
CREATE INDEX IF NOT EXISTS idx_progress_task ON task_progress (task_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON compliance_cases (status, due_at);

-- Progress summary per user and tab
CREATE VIEW IF NOT EXISTS v_tab_progress AS
SELECT p.user_id,
       t.tab,
       COUNT(*)                                        AS total,
       SUM(CASE WHEN p.completed = 1 THEN 1 ELSE 0 END) AS done
FROM task_progress p
JOIN tasks t ON t.id = p.task_id
GROUP BY p.user_id, t.tab;
