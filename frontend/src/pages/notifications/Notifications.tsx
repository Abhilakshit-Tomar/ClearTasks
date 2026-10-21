import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCircle2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/services/api";
import { useRemoteData } from "@/hooks/useRemoteData";
import { errorMessage, formatDate } from "@/lib/studio";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/Feedback";

export default function Notifications() {
  const loader = useCallback(() => notificationService.getNotifications(), []);
  const { data, loading, error, refresh, updateData } = useRemoteData(
    loader,
    10000,
  );
  const [pending, setPending] = useState<string[]>([]);
  const locks = useRef(new Set<string>());
  async function markAsRead(id: string) {
    if (locks.current.has(id)) return;
    locks.current.add(id);
    setPending((previous) => [...previous, id]);
    try {
      await notificationService.markAsRead(id);
      updateData((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      toast.success("Marked as read");
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          "This update couldn’t be marked as read. Please try again.",
        ),
      );
    } finally {
      locks.current.delete(id);
      setPending((previous) => previous.filter((value) => value !== id));
    }
  }
  if (loading) return <LoadingState label="Loading your notifications…" />;
  const unread = data?.filter((item) => !item.is_read).length || 0;
  return (
    <div className="page-shell max-w-4xl">
      <div className="page-heading">
        <div>
          <h1>A little heads-up.</h1>
          <p>
            Your team’s updates, assignments, and shared moments of progress.
          </p>
        </div>
        {data && <span className="status-badge">{unread} unread</span>}
      </div>
      {error && (
        <ErrorState
          compact={!!data}
          message={error}
          retry={() => void refresh()}
        />
      )}
      {data && (
        <>
          {data.length === 0 ? (
            <EmptyState
              title="You’re all caught up."
              description="When there’s a project update or something needs your attention, you’ll find it here."
            />
          ) : (
            <div className="surface divide-y">
              {data.map((notification) => {
                const Icon =
                  notification.type === "PROJECT_INVITATION"
                    ? UserPlus
                    : notification.type === "TASK_OVERDUE"
                      ? AlertCircle
                      : notification.type === "MILESTONE_COMPLETED"
                        ? CheckCircle2
                        : Bell;
                const to =
                  notification.type === "PROJECT_INVITATION"
                    ? "/accept-invitation"
                    : notification.task_id && notification.project_id
                      ? `/projects/${notification.project_id}/tasks/${notification.task_id}`
                      : notification.project_id
                        ? `/projects/${notification.project_id}`
                        : null;
                return (
                  <article
                    key={notification.id}
                    className={`flex gap-4 p-5 sm:p-6 ${!notification.is_read ? "bg-primary/[.035]" : ""}`}
                  >
                    <Icon
                      className={`mt-1 size-5 shrink-0 ${notification.type === "TASK_OVERDUE" ? "text-destructive" : "text-primary"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-sm font-semibold">
                        {notification.title}
                        {!notification.is_read && (
                          <span
                            className="ml-2 inline-block size-1.5 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        )}
                      </h2>
                      <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(notification.created_at, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {to && (
                          <Button
                            asChild
                            variant="link"
                            size="sm"
                            className="px-0"
                          >
                            <Link to={to}>
                              {notification.type === "PROJECT_INVITATION"
                                ? "View invitation"
                                : "Open update"}
                            </Link>
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            pending={pending.includes(notification.id)}
                            pendingLabel="Saving…"
                            onClick={() => void markAsRead(notification.id)}
                          >
                            <Check />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
