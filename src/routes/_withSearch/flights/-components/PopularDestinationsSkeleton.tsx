import Skeleton from "~/components/Skeleton";

const ITEMS = Array.from({ length: 3 });

export default function PopularDestinationsSkeleton() {
    return ITEMS.map((_, i) => <Skeleton key={i} className="h-28" />);
}
