import { SkeletonBlock } from "./skeletonBloack";

function PlansPageSkeleton() {
    return (
        <div>
            {/* Company Filter Pills */}
            <div className="flex justify-center my-6 px-4">
                <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonBlock key={i} className="h-10 w-24 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Plans Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-40 pb-20">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="border rounded-xl p-6 shadow-sm space-y-4"
                    >
                        <SkeletonBlock className="h-6 w-40" />
                        <SkeletonBlock className="h-4 w-full" />
                        <SkeletonBlock className="h-4 w-3/4" />
                        <SkeletonBlock className="h-10 w-full rounded-lg mt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlansPageSkeleton;
