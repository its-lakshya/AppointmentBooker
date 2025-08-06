"use client";
import { Badge } from '@/components/ui/badge';
import {
    Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Service } from '@/types/db';
import { getDate } from '@/utils/dateTime/date';

type ServicesListProps = {
  data: {
    services?: Service[];
    error: string | null;
  };
};

const ServicesList = ({ data }: ServicesListProps) => {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      {data?.services?.map((service) => (
        <Card key={service.id} className="@container/card">
          <CardHeader>
            <CardTitle
              className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {service.name}
            </CardTitle>
            <CardDescription className="h-16">
              <p
                className="line-clamp-3"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {service.description} Lorem ipsum dolor sit amet, consectetur
                adipisicing elit. Vitae temporibus eius doloribus explicabo eos
                sed mollitia quis, ab ullam similique possimus ratione magni
                animi natus nam iusto ipsam quam. Quibusdam, hic? Quas
                doloribus, culpa nostrum molestiae a voluptatem maiores
                distinctio!
              </p>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium items-center">
              {getDate(service.created_at)}
              <CardAction>
                <Badge variant="outline">${service.price}</Badge>
              </CardAction>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ServicesList;
