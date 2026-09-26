export const AGENT_TASK_STATES = new Set([
  "queued", "in_progress", "completed", "failed", "idle",
  "waiting_for_user", "timed_out", "cancelled",
]);

export const AGENT_TASK_MODELS = new Set([
  "claude-sonnet-4.5",
  "claude-sonnet-4.6",
  "claude-opus-4.5",
  "claude-opus-4.6",
  "gpt-5.2-codex",
  "gpt-5.3-codex",
  "gpt-5.4",
]);

const API_VERSION = "2026-03-10";

function requireToken(token) {
  if (!token || typeof token !== "string") throw new Error("ALMAGO_COPILOT_AUTOPILOT_TOKEN is required.");
  return token;
}

function validateTask(task) {
  if (!task || typeof task !== "object" || !task.id || !AGENT_TASK_STATES.has(task.state)) {
    throw new Error("GitHub returned an invalid or unknown Agent Task.");
  }
  return task;
}

async function request({ token, method = "GET", path, body, fetchImpl = fetch }) {
  const response = await fetchImpl("https://api.github.com" + path, {
    method,
    headers: {
      Authorization: "Bearer " + requireToken(token),
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const detail = await response.text();
    const error = new Error("GitHub Agent Tasks " + response.status + ": " + detail.slice(0, 1200));
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

export async function startAgentTask({
  owner, repo, token, prompt, baseRef, model, customAgent = null,
  headRef = null, createPullRequest = true, fetchImpl = fetch,
}) {
  if (!owner || !repo || !prompt || !baseRef) throw new Error("owner, repo, prompt and baseRef are required.");
  if (!AGENT_TASK_MODELS.has(model)) throw new Error("Unsupported Agent Tasks model: " + model);
  const body = {
    prompt,
    base_ref: baseRef,
    model,
    create_pull_request: Boolean(createPullRequest),
    ...(customAgent ? { custom_agent: customAgent } : {}),
    ...(headRef ? { head_ref: headRef } : {}),
  };
  const task = await request({
    token,
    method: "POST",
    path: "/agents/repos/" + owner + "/" + repo + "/tasks",
    body,
    fetchImpl,
  });
  return validateTask(task);
}

export async function getAgentTask({ owner, repo, token, taskId, fetchImpl = fetch }) {
  if (!taskId) throw new Error("taskId is required.");
  const task = await request({
    token,
    path: "/agents/repos/" + owner + "/" + repo + "/tasks/" + encodeURIComponent(taskId),
    fetchImpl,
  });
  return validateTask(task);
}

export async function listAgentTasks({ owner, repo, token, fetchImpl = fetch }) {
  const data = await request({
    token,
    path: "/agents/repos/" + owner + "/" + repo + "/tasks",
    fetchImpl,
  });
  return (Array.isArray(data?.tasks) ? data.tasks : []).map(validateTask);
}
