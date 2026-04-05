"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type SetupTokenReason = "INITIAL_ENROLLMENT" | "ADD_PASSKEY" | "RECOVERY";

interface IssueSetupTokenButtonProps {
  userId: string;
  username: string;
  reason: SetupTokenReason;
  label: string;
}

interface IssueSetupTokenResponse {
  setupToken: {
    setupUrl: string;
    reason: SetupTokenReason;
    expiresAt: string;
  };
  recovery: {
    revokedPasskeyCount: number;
    revokedSessionCount: number;
    revokedSetupTokenCount: number;
  };
}

interface IssueSetupTokenErrorResponse {
  error?: string;
}

const buttonClassesByReason: Record<SetupTokenReason, string> = {
  INITIAL_ENROLLMENT:
    "border-neutral-700 text-neutral-200 hover:border-neutral-500 hover:text-white",
  ADD_PASSKEY:
    "border-sky-700/70 text-sky-200 hover:border-sky-500 hover:text-sky-50",
  RECOVERY:
    "border-red-700/70 text-red-200 hover:border-red-500 hover:text-red-50",
};

export default function IssueSetupTokenButton({
  userId,
  username,
  reason,
  label,
}: IssueSetupTokenButtonProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedToken, setIssuedToken] = useState<IssueSetupTokenResponse | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleIssue() {
    setSubmitting(true);
    setError(null);
    setCopyStatus("idle");

    try {
      const response = await fetch(`/api/users/${userId}/setup-token`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          reason,
        }),
      });
      const payload = (await response.json()) as
        | IssueSetupTokenResponse
        | IssueSetupTokenErrorResponse;

      if (!response.ok || !("setupToken" in payload)) {
        setError(
          "error" in payload
            ? payload.error ?? "Failed to issue a setup link."
            : "Failed to issue a setup link."
        );
        return;
      }

      setIssuedToken(payload);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!issuedToken) {
      return;
    }

    try {
      await navigator.clipboard.writeText(issuedToken.setupToken.setupUrl);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleIssue}
        disabled={submitting}
        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassesByReason[reason]}`}
      >
        {submitting ? "Issuing..." : label}
      </button>

      {error && <p className="text-xs text-red-300">{error}</p>}

      {issuedToken && (
        <div className="rounded-xl border border-neutral-700 bg-neutral-950/80 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{username}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-yellow-400">
                {issuedToken.setupToken.reason}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:text-white"
            >
              Copy
            </button>
          </div>

          <p className="mt-3 break-all rounded-lg bg-black/20 px-3 py-3 font-mono text-xs text-neutral-200">
            {issuedToken.setupToken.setupUrl}
          </p>

          {reason === "RECOVERY" && (
            <p className="mt-3 text-xs text-neutral-400">
              Revoked {issuedToken.recovery.revokedPasskeyCount} passkey(s),{" "}
              {issuedToken.recovery.revokedSessionCount} session(s), and{" "}
              {issuedToken.recovery.revokedSetupTokenCount} outstanding setup token(s).
            </p>
          )}

          {copyStatus === "copied" && (
            <p className="mt-2 text-xs text-emerald-300">Link copied.</p>
          )}
          {copyStatus === "failed" && (
            <p className="mt-2 text-xs text-red-300">Unable to copy link.</p>
          )}
        </div>
      )}
    </div>
  );
}
