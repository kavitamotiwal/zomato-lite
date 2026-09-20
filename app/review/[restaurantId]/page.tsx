"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const router = useRouter();
  const restaurantId = Number(params.restaurantId);

  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRestaurantName(data?.name ?? ""));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, rating, comment: comment.trim() }),
    });
    if (res.status === 400) {
      const data = await res.json();
      setError(data.error);
      setSubmitting(false);
      return;
    }
    if (res.ok) {
      router.push(`/restaurant/${restaurantId}`);
      return;
    }
    setError("Something went wrong. Please try again.");
    setSubmitting(false);
  }

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14">
      <h1 className="text-2xl font-medium text-foreground">{restaurantName}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Leave a review for this restaurant
      </p>

      <div className="mt-10">
        <p className="text-sm font-medium text-foreground">Your rating</p>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
              className={`text-3xl leading-none transition-colors ${
                value <= rating ? "text-accent" : "text-neutral-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <label htmlFor="comment" className="text-sm font-medium text-foreground">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="What was the food like?"
          className="mt-3 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-10 w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity enabled:hover:opacity-90 disabled:opacity-40"
      >
        Submit review
      </button>
    </main>
  );
}