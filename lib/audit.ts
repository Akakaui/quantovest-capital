export interface AuditEvent {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string | number;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export function logAuditEvent(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string | number,
  details?: Record<string, unknown>
): void {
  const event: AuditEvent = {
    actorId,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date(),
  };

  console.log("[AUDIT]", JSON.stringify(event));
}
