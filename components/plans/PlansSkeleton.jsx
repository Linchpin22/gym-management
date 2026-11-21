export default function PlansSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#F5F7F6]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-8 w-64 rounded-lg bg-gray-200" />
            <div className="h-4 w-80 max-w-full rounded bg-gray-100" />
          </div>
          <div className="h-12 w-44 rounded-xl bg-gray-200" />
        </div>

        <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#E8EDE9] bg-white p-5"
            >
              <div className="mb-5 flex justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-10 w-10 rounded-xl bg-[#F0F5EC]" />
              </div>
              <div className="h-8 w-16 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-36 rounded bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="mb-5 space-y-2">
          <div className="h-6 w-28 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#E8EDE9] bg-white p-6"
            >
              <div className="mb-5 flex justify-between">
                <div className="h-12 w-12 rounded-xl bg-[#F0F5EC]" />
                <div className="h-6 w-16 rounded-full bg-gray-100" />
              </div>
              <div className="h-6 w-36 rounded bg-gray-200" />
              <div className="mt-4 h-9 w-32 rounded bg-gray-200" />
              <div className="my-6 space-y-4 border-y border-[#EEF1EF] py-5">
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-100" />
              </div>
              <div className="h-10 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}