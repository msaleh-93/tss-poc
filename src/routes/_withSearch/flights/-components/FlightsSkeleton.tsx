import { Card } from "~/components/Card";
import Skeleton from "~/components/Skeleton";

const ITEMS = Array.from({ length: 5 });

export default function FlightsSkeleton() {
    return ITEMS.map((_, i) => (
        <Card key={i}>
            <div className="flex flex-col gap-2">
                <Skeleton className="w-72 h-5" />
                <Skeleton className="w-xl h-5" />
                <Skeleton className="w-xl h-5" />
            </div>
            <div className="flex flex-col gap-2 items-center">
                <Skeleton className="w-12 h-5" />
                <Skeleton className="w-16 h-9" />
            </div>
        </Card>
    ));
}
