
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  );
}

export default function MembersSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7F6]">
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <Skeleton className="h-10 w-32 rounded-xl" />
      </header>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1500px] mx-auto space-y-7">
        <div className="rounded-3xl bg-[#17211A] p-6 sm:p-8 space-y-4">
          <Skeleton className="h-5 w-36 bg-white/10" />
          <Skeleton className="h-9 w-64 max-w-full bg-white/10" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/10" />

          <div className="flex flex-wrap gap-3 pt-2">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-16 w-32 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-16" />
                </div>

                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>

              <Skeleton className="h-3 w-36 mt-5" />
            </div>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>

              <Skeleton className="h-11 w-full md:w-80 rounded-xl" />
            </div>

            <div className="flex gap-2 mt-6 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-10 w-24 rounded-xl shrink-0" />
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="bg-[#F7F9F7] px-6 py-4 flex gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="h-3 flex-1" />
              ))}
            </div>

            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="px-6 py-5 flex items-center gap-8">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />

                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>

                  {[1, 2, 3].map((col) => (
                    <Skeleton key={col} className="h-4 flex-1" />
                  ))}

                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-xl" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>

                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
