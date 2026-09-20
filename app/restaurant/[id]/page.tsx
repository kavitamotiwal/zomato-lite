"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Review = { id: number; rating: number; comment: string; createdAt: string };

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const [data, setData] = useState<RestaurantData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => json && setData(json));
  }, [restaurantId]);

  if (notFound) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        <p className="text-neutral-600">Restaurant not found.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-[560px] px-6 py-14">
        <p className="text-neutral-600">Loading…</p>
      </main>
    );
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  const stars = (rating: number) =>
    [1, 2, 3, 4, 5].map((value) => (
      <span
        key={value}
        className={value <= rating ? "text-accent" : "text-neutral-300"}
      >
        ★
      </span>
    ));

  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-14">
      <h1 className="text-2xl font-medium">{data.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {data.cuisine} · {data.area}
      </p>

      {data.averageRating !== null ? (
        <div className="mt-10 flex items-end gap-3">
          <p className="text-6xl font-semibold leading-none text-foreground">
            {data.averageRating}
          </p>
          <p className="pb-1 text-sm text-neutral-500">
            {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <p className="text-neutral-600">No reviews yet.</p>
          <p className="mt-1 text-sm text-neutral-500">Be the first to rate {data.name}.</p>
        </div>
      )}

      {data.latestReview && (
        <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Latest review
          </p>
          <div className="mt-3 text-lg">{stars(data.latestReview.rating)}</div>
          <p className="mt-2 text-neutral-800">{data.latestReview.comment}</p>
          <p className="mt-2 text-xs text-neutral-500">
            {formatDate(data.latestReview.createdAt)}
          </p>
        </section>
      )}

      {data.reviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Older reviews
          </h2>
          <ul className="mt-4 divide-y divide-neutral-200">
            {data.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <div className="text-base">{stars(review.rating)}</div>
                <p className="mt-2 text-neutral-800">{review.comment}</p>
                <p className="mt-2 text-xs text-neutral-500">
                  {formatDate(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href={`/review/${restaurantId}`}
        className="mt-12 inline-block rounded-lg bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Write a review
      </Link>
    </main>
  );
}