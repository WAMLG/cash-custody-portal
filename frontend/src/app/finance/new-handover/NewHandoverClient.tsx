"use client";

import { useEffect, useState, type FormEvent } from "react";
import { StateBlock } from "@/components/StateBlock";
import { ApiError, apiRequest } from "@/lib/api";
import { unwrapCollection } from "@/lib/api-shapes";
import { useAuth } from "@/lib/auth";
import {
  currentDateInputValue,
  currentTimeInputValue,
  formatMoney,
} from "@/lib/format";
import type { AuthorizedReceiver, CashHandover, CollectionResponse } from "@/types";

type StoreHandoverResponse = {
  message: string;
  data: CashHandover;
};

export function NewHandoverClient() {
  const { token, user } = useAuth();
  const [receivers, setReceivers] = useState<AuthorizedReceiver[]>([]);
  const [amount, setAmount] = useState("");
  const [handoverDate, setHandoverDate] = useState(currentDateInputValue());
  const [handoverTime, setHandoverTime] = useState(currentTimeInputValue());
  const [receiverId, setReceiverId] = useState("");
  const [financeNote, setFinanceNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReceivers() {
      if (!token) {
        return;
      }

      try {
        const response = await apiRequest<
          AuthorizedReceiver[] | CollectionResponse<AuthorizedReceiver>
        >("/authorized-receivers", { token });
        const nextReceivers = unwrapCollection(response);

        if (isMounted) {
          setReceivers(nextReceivers);
          setReceiverId((current) => current || String(nextReceivers[0]?.id ?? ""));
        }
      } catch {
        if (isMounted) {
          setError("Could not load authorized receivers.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReceivers();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!receiverId) {
      setError("Please select who received the cash.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<StoreHandoverResponse>(
        "/finance/cash-handovers",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            handover_date: handoverDate,
            handover_time: handoverTime,
            amount,
            handed_to_receiver_id: Number(receiverId),
            finance_note: financeNote || null,
          }),
        },
      );

      setSuccess(
        `${response.message} Amount: ${formatMoney(response.data.amount)}`,
      );
      setAmount("");
      setFinanceNote("");
      setHandoverDate(currentDateInputValue());
      setHandoverTime(currentTimeInputValue());
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not submit the cash handover.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <StateBlock
        title="Loading Form"
        message="Fetching authorized receivers."
      />
    );
  }

  return (
    <form
      className="rounded-md border border-[#d8dde5] bg-white p-4 shadow-sm sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[#384150]">Amount</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#384150]">Handed by</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#d8dde5] bg-[#f6f7f9] px-3 text-[#687080] sm:h-11"
            type="text"
            value={user?.name ?? ""}
            readOnly
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#384150]">Date</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
            type="date"
            value={handoverDate}
            onChange={(event) => setHandoverDate(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#384150]">Time</span>
          <input
            className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
            type="time"
            value={handoverTime}
            onChange={(event) => setHandoverTime(event.target.value)}
            required
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[#384150]">
            Handed to whom
          </span>
          <select
            className="mt-2 h-12 w-full rounded-md border border-[#cfd6df] px-3 outline-none focus:border-[#1f7a5c] sm:h-11"
            value={receiverId}
            onChange={(event) => setReceiverId(event.target.value)}
            required
          >
            {receivers.map((receiver) => (
              <option key={receiver.id} value={receiver.id}>
                {receiver.name} - {receiver.relationship_or_role}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[#384150]">
            Finance note
          </span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-[#cfd6df] px-3 py-2 outline-none focus:border-[#1f7a5c]"
            value={financeNote}
            onChange={(event) => setFinanceNote(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-[#f0c4bd] bg-[#fff5f3] px-3 py-2 text-sm text-[#9d2f1f]">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-md border border-[#a8d5c0] bg-[#edf8f3] px-3 py-2 text-sm text-[#146245]">
          {success}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          className="h-12 w-full rounded-md bg-[#1f7a5c] px-5 text-sm font-semibold text-white hover:bg-[#19664d] disabled:cursor-not-allowed disabled:bg-[#8bb7a7] sm:h-11 sm:w-auto"
          type="submit"
          disabled={isSubmitting || receivers.length === 0}
        >
          {isSubmitting ? "Submitting..." : "Submit Handover"}
        </button>
      </div>
    </form>
  );
}
