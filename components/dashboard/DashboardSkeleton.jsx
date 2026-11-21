function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <div className="rounded-3xl bg-[#17211A] p-6 md:p-9 space-y-5">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-10 w-72 max-w-full bg-white/10" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/10" />
          <Skeleton className="h-11 w-36 bg-white/10 rounded-xl" />
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className="flex justify-between">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>
              <Skeleton className="h-3 w-36 mt-5" />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60 mt-3" />
            </div>

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-5 flex items-center justify-between gap-4 border-b border-gray-100"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-11 h-11 rounded-full shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48 mt-3" />
              <div className="space-y-3 mt-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>

            <div className="bg-[#17211A] rounded-2xl p-6">
              <Skeleton className="h-4 w-36 bg-white/10" />
              <Skeleton className="h-10 w-24 mt-5 bg-white/10" />
              <Skeleton className="h-3 w-32 mt-2 bg-white/10" />
              <Skeleton className="h-2 w-full mt-6 bg-white/10 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}