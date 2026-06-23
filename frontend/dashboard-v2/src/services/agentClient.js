export function getPlannedAgentStatus() {
  return {
    connected: false,
    status: "planned",
    supportedActions: [
      "agent.ping",
      "agent.status.request"
    ]
  };
}
